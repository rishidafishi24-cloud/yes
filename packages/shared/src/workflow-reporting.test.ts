import { describe, expect, it } from "vitest";
import {
  BRANCH_BRIEFING_PREFIX,
  INTERACTION_SUMMARY_PREFIX,
  checkpointMarker,
  hasInteractionFields,
  inferWorkflowBranch,
  isBranchBriefingTitle,
  isInteractionSummaryTitle,
  isInternalReportingTitle,
  matchesInteractionReply,
  readCheckpoint,
} from "./workflow-reporting";

describe("internal reporting titles", () => {
  it("recognises generated reporting tasks", () => {
    expect(isInteractionSummaryTitle(`${INTERACTION_SUMMARY_PREFIX} leadership -> coding`)).toBe(true);
    expect(isBranchBriefingTitle(`${BRANCH_BRIEFING_PREFIX} Coding`)).toBe(true);
  });

  it("does not match operator tasks that merely mention the topic", () => {
    expect(isInteractionSummaryTitle("Write the interaction summary by hand")).toBe(false);
    expect(isBranchBriefingTitle("Investigate [Branch briefing] drift")).toBe(false);
  });

  it("requires a title body, not a bare prefix", () => {
    // A bare prefix is not a task the system generated, so it is not filtered.
    expect(isInteractionSummaryTitle(INTERACTION_SUMMARY_PREFIX)).toBe(false);
    expect(isBranchBriefingTitle(BRANCH_BRIEFING_PREFIX)).toBe(false);
  });

  it("covers both reporting kinds in one predicate", () => {
    expect(isInternalReportingTitle(`${INTERACTION_SUMMARY_PREFIX} a -> b`)).toBe(true);
    expect(isInternalReportingTitle(`${BRANCH_BRIEFING_PREFIX} Coding`)).toBe(true);
    expect(isInternalReportingTitle("Ship the release")).toBe(false);
  });

  it("keeps the two prefixes distinct", () => {
    // If these ever collided, every summary would be filtered as a briefing.
    expect(isInteractionSummaryTitle(`${BRANCH_BRIEFING_PREFIX} x`)).toBe(false);
    expect(isBranchBriefingTitle(`${INTERACTION_SUMMARY_PREFIX} x`)).toBe(false);
  });
});

describe("inferWorkflowBranch", () => {
  it("prefers an explicit metadata branch", () => {
    expect(
      inferWorkflowBranch({ name: "Trader", role: "analyst", metadata: { workflow: { branch: "trading" } } }),
    ).toBe("trading");
  });

  it("ignores an unrecognised metadata branch and falls back to identity", () => {
    expect(
      inferWorkflowBranch({ name: "Memory Bot", role: "agent", metadata: { workflow: { branch: "nonsense" } } }),
    ).toBe("memory");
  });

  it("classifies by role and name", () => {
    expect(inferWorkflowBranch({ name: "Chief", role: "ceo" })).toBe("leadership");
    expect(inferWorkflowBranch({ name: "Codex Helper", role: "agent" })).toBe("coding");
    expect(inferWorkflowBranch({ name: "Growth", role: "agent", title: "Business" })).toBe("business");
    expect(inferWorkflowBranch({ name: "Editor", role: "agent", title: "Content" })).toBe("content");
  });

  it("defaults to coding when nothing matches", () => {
    // Every unclassified agent currently lands in the coding queue, so a new
    // role does not silently disappear from the board.
    expect(inferWorkflowBranch({ name: "Widget", role: "agent" })).toBe("coding");
  });
});

describe("checkpoints", () => {
  const checkpoint = { eventId: "3f1d1935-0000-4000-8000-000000000000", sourceAt: "2026-09-27T10:00:00.000Z" };

  it("round-trips a marker", () => {
    expect(readCheckpoint(`intro\n${checkpointMarker(checkpoint)}\nrest`)).toEqual(checkpoint);
  });

  it("returns null when absent, malformed, or not a valid timestamp", () => {
    expect(readCheckpoint("no marker here")).toBeNull();
    expect(readCheckpoint("<!-- interaction-checkpoint:not-a-uuid:2026-09-27T10:00:00.000Z -->")).toBeNull();
    expect(readCheckpoint(`<!-- interaction-checkpoint:${checkpoint.eventId}:whenever --> `)).toBeNull();
  });

  it("requires every interaction heading to be present", () => {
    const headings = [
      "What they're discussing",
      "Why the other branch was involved",
      "Decisions or advice",
      "Next action and owner",
    ];
    const body = headings.map((h) => `## ${h}\ntext`).join("\n");
    expect(hasInteractionFields(body)).toBe(true);

    for (const missing of headings) {
      const partial = headings.filter((h) => h !== missing).map((h) => `## ${h}\ntext`).join("\n");
      expect(hasInteractionFields(partial)).toBe(false);
    }
  });

  it("only accepts a reply that quotes the exact checkpoint it answers", () => {
    const headings = [
      "What they're discussing",
      "Why the other branch was involved",
      "Decisions or advice",
      "Next action and owner",
    ];
    const body = `${headings.map((h) => `## ${h}\ntext`).join("\n")}\n${checkpointMarker(checkpoint)}`;
    expect(matchesInteractionReply(body, checkpoint)).toBe(true);

    // Right event, wrong timestamp.
    expect(matchesInteractionReply(body, { ...checkpoint, sourceAt: "2026-09-27T11:00:00.000Z" })).toBe(false);
    // Right checkpoint, missing structure.
    expect(matchesInteractionReply(checkpointMarker(checkpoint), checkpoint)).toBe(false);
  });
});
