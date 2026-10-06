import { describe, it, expect } from "vitest";
import type { Agent, Issue } from "@paperclipai/shared";
import { operationalTasks, projectParticipants, contextualMessage } from "./command-center";
import { observedCollaboration } from "./observed-collaboration";
import { checkpointMarker, matchesInteractionReply, readCheckpoint } from "@paperclipai/shared/workflow-reporting";

const owner = { id: "owner", name: "Coding Lead", role: "engineer" } as Agent;
const ceo = { id: "ceo", name: "CEO", role: "ceo" } as Agent;
const task = { id: "task", title: "Ship feature", assigneeAgentId: owner.id } as Issue;
function event(id: string, entityId = "task", agentId: string | null = "ceo") {
  return { id, companyId: "company", actorType: "agent", actorId: agentId ?? "board", runId: null, entityId, agentId, entityType: "issue", action: "issue.comment_added", details: { commentId: id }, createdAt: new Date("2026-09-27T01:00:00.000Z") } as Parameters<typeof observedCollaboration>[0][number];
}

describe("command center evidence", () => {
  it("keeps conversation containers and reporting tasks out of operational counts", () => {
    expect(operationalTasks([task, { ...task, conversationAgentId: "ceo" }, { ...task, title: "[Interaction summary] leadership -> coding" }, { ...task, title: "[Branch briefing] Coding" }])).toEqual([task]);
  });

  it("treats a bare reporting prefix as an operational task, not a reporting task", () => {
    // Guards the shared prefix helpers: a title equal to the prefix has no
    // subject, so it is not a generated reporting task.
    const bare = { ...task, title: "[Branch briefing]" };
    const bareSummary = { ...task, title: "[Interaction summary]" };
    expect(operationalTasks([bare, bareSummary])).toEqual([bare, bareSummary]);
  });

  it("includes persistent lead even when no tasks are assigned", () => {
    expect(projectParticipants([ceo, owner], [], owner.id)).toEqual([owner]);
  });
  it("binds the selected project into the actual message without changing the conversation", () => {
    expect(contextualMessage("  What is next?  ", { id: "p1", name: "Game" })).toBe("Project context: Game (p1)\n\nWhat is next?");
    expect(contextualMessage(" Hello ")).toBe("Hello");
  });
  it("counts genuine cross-branch comments, deduplicates, and discloses unresolved entities", () => {
    const result = observedCollaboration([event("a"), event("a"), event("b", "missing"), event("c", "task", null), event("d", "task", "owner")], [task], [ceo, owner]);
    expect(result.commentCount).toBe(1);
    expect(result.unresolved).toBe(1);
    expect(result.branches[0]).toMatchObject({ from: "leadership", to: "coding" });
  });
  it("excludes reporting and same-branch comments", () => {
    const coder = { ...owner, id: "coder" };
    expect(observedCollaboration([event("a"), event("b", "task", "coder")], [{ ...task, title: "[Branch briefing] Coding" }], [ceo, owner, coder]).commentCount).toBe(0);
    expect(observedCollaboration([event("b", "task", "coder")], [task], [ceo, owner, coder]).commentCount).toBe(0);
  });
});

describe("interaction summary checkpoint", () => {
  const first = { eventId: "11111111-1111-4111-8111-111111111111", sourceAt: "2026-09-27T01:00:00.000Z" };
  const next = { ...first, eventId: "22222222-2222-4222-8222-222222222222" };
  const fields = "## What they're discussing\nScope.\n## Why the other branch was involved\nAdvice.\n## Decisions or advice\nAgreed.\n## Next action and owner\nCoding lead.";
  it("does not treat a later completion time or partial answer as coverage", () => {
    expect(matchesInteractionReply(fields, first)).toBe(false);
    expect(matchesInteractionReply(`Some text\n${checkpointMarker(first)}`, first)).toBe(false);
  });
  it("requires the exact requested event even when timestamps are equal", () => {
    expect(matchesInteractionReply(`${fields}\n${checkpointMarker(first)}`, first)).toBe(true);
    expect(matchesInteractionReply(`${fields}\n${checkpointMarker(first)}`, next)).toBe(false);
    expect(readCheckpoint(checkpointMarker(first))).toEqual(first);
  });
});
