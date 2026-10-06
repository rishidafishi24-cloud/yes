import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkpointMarker, type InteractionReportingState } from "@paperclipai/shared/workflow-reporting";
import { agents } from "@paperclipai/db";

const tasks = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn() }));
vi.mock("../services/issues.js", () => ({ issueService: () => tasks }));
vi.mock("../services/activity-log.js", () => ({ logActivity: vi.fn().mockResolvedValue({}) }));
import { interactionSummaryService } from "../services/interaction-summaries.js";

const stamp = "2026-09-27T01:00:00.000Z";
const eventId = "11111111-1111-4111-8111-111111111111";
const newerId = "22222222-2222-4222-8222-222222222222";
const fields = "## What they're discussing\nScope.\n## Why the other branch was involved\nAdvice.\n## Decisions or advice\nAgreed.\n## Next action and owner\nCoding lead.";
function state(): InteractionReportingState {
  return { version: 1, cursor: { at: stamp, id: eventId }, pairs: { "leadership:coding": {
    from: "leadership", to: "coding", latest: { eventId, sourceAt: stamp }, taskIds: ["source-task"], status: "pending", dueAt: stamp,
  } } };
}

/** Ordered query results keep tests independent of a database/server boot.
 * Persisted metadata is shared by fresh service instances to exercise restart behavior. */
function harness(initial: InteractionReportingState) {
  const reporter = { id: "reporter", companyId: "company", status: "idle", metadata: { paperclipBuiltInAgent: { key: "summarizer", featureKeys: [] }, interactionReporting: initial } };
  const rows: unknown[][] = [];
  const db: any = {
    select: () => {
      const result = rows.shift();
      if (!result) throw new Error("Unexpected database read");
      const chain: any = { then: (resolve: (value: unknown) => unknown, reject: (error: unknown) => unknown) => Promise.resolve(result).then(resolve, reject) };
      for (const method of ["from", "where", "for", "orderBy", "limit", "innerJoin"]) chain[method] = () => chain;
      return chain;
    },
    update: (table: unknown) => ({ set: (patch: any) => ({ where: async () => { if (table === agents) Object.assign(reporter, patch); } }) }),
    transaction: async (callback: (transaction: unknown) => unknown) => callback(db),
  };
  const wakeup = vi.fn().mockResolvedValue({ id: "wake" });
  function reads(...tail: unknown[][]) {
    rows.push([{ id: reporter.id }], [reporter], [{ status: "active" }], [reporter], [], ...tail);
  }
  return { reporter, rows, db, wakeup, reads, service: () => interactionSummaryService(db, { wakeup }) };
}

describe("durable interaction reporting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tasks.create.mockResolvedValue({ id: "report-task", status: "todo" });
    tasks.update.mockResolvedValue({ id: "report-task", status: "todo" });
  });
  it("persists the requested checkpoint before wake and does not re-request after restart", async () => {
    const h = harness(state());
    h.reads([], [h.reporter]); // existing report lookup, post-wake locked reporter
    await h.service().tick(new Date(stamp));
    expect(tasks.create).toHaveBeenCalledTimes(1);
    expect(h.wakeup).toHaveBeenCalledWith("reporter", expect.objectContaining({ idempotencyKey: `interaction-summary:report-task:${eventId}` }));
    expect(h.reporter.metadata.interactionReporting.pairs["leadership:coding"]).toMatchObject({ status: "queued", wakePending: false, requested: { eventId } });
    h.reads([{ id: "report-task", status: "in_progress" }], []);
    await h.service().tick(new Date(Date.parse(stamp) + 60_000));
    expect(tasks.create).toHaveBeenCalledTimes(1);
    expect(h.wakeup).toHaveBeenCalledTimes(1);
  });
  it("coalesces a burst into the latest checkpoint and one bounded evidence set", async () => {
    const h = harness(state());
    const ceo = { id: "ceo", role: "ceo", name: "CEO" };
    const coder = { id: "coder", role: "engineer", name: "Coder" };
    const events = [eventId, newerId].map((id) => ({ id, agentId: ceo.id, createdAt: new Date(stamp) }));
    h.rows.push([{ id: "reporter" }], [h.reporter], [{ status: "active" }], [h.reporter, ceo, coder], events,
      events.map((event) => ({ event, task: { id: "source-task", title: "Build", assigneeAgentId: "coder" }, comment: { authorType: "agent", createdAt: new Date(stamp) } })));
    await h.service().tick(new Date(stamp));
    expect(h.reporter.metadata.interactionReporting.pairs["leadership:coding"].latest.eventId).toBe(newerId);
    expect(tasks.create).not.toHaveBeenCalled();
    h.reads([], [h.reporter]);
    await h.service().tick(new Date(Date.parse(stamp) + 31_000));
    expect(h.wakeup).toHaveBeenCalledTimes(1);
    expect(tasks.create.mock.calls[0][1].description).toContain(checkpointMarker({ eventId: newerId, sourceAt: stamp }));
  });
  it("keeps new discussion pending when an older summary finishes", async () => {
    const initial = state();
    const pair = initial.pairs["leadership:coding"];
    pair.requested = { ...pair.latest }; pair.latest = { eventId: newerId, sourceAt: stamp };
    pair.status = "queued"; pair.taskId = "report-task"; pair.requestedAt = stamp;
    const h = harness(initial);
    h.reads([{ id: "report-task", status: "in_progress" }], [{ body: `${fields}\n${checkpointMarker(pair.requested)}` }], [{ id: "report-task", status: "in_progress" }]);
    await h.service().tick(new Date(stamp));
    expect(h.reporter.metadata.interactionReporting.pairs["leadership:coding"]).toMatchObject({ status: "pending", completed: { eventId }, latest: { eventId: newerId } });
    expect(h.wakeup).not.toHaveBeenCalled();
  });
  it("surfaces a terminal report without a valid checkpoint instead of retrying the model", async () => {
    const initial = state();
    Object.assign(initial.pairs["leadership:coding"], { status: "queued", taskId: "report-task", requested: { eventId, sourceAt: stamp }, requestedAt: stamp });
    const h = harness(initial);
    h.reads([{ id: "report-task", status: "done" }], [{ body: fields }]);
    await h.service().tick(new Date(stamp));
    expect(h.reporter.metadata.interactionReporting.pairs["leadership:coding"].status).toBe("failed");
    expect(h.wakeup).not.toHaveBeenCalled();
    expect(tasks.create).not.toHaveBeenCalled();
  });
  it("retries a failed wake with the same durable idempotency key", async () => {
    const h = harness(state());
    h.wakeup.mockRejectedValueOnce(new Error("temporary unavailable"));
    h.reads([], [h.reporter]);
    await h.service().tick(new Date(stamp));
    h.reads([{ id: "report-task", status: "todo" }], [], [h.reporter]);
    await h.service().tick(new Date(Date.parse(stamp) + 61_000));
    expect(h.wakeup).toHaveBeenCalledTimes(2);
    expect(h.wakeup.mock.calls[0][1].idempotencyKey).toBe(h.wakeup.mock.calls[1][1].idempotencyKey);
    expect(tasks.create).toHaveBeenCalledTimes(1);
  });
});
