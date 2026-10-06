import { describe, expect, it } from "vitest";
import type { IssueComment } from "@paperclipai/shared";
import {
  BRANCH_BRIEFING_PREFIX,
  INTERACTION_SUMMARY_PREFIX,
  interactionSummaryTitle,
  isBranchBriefingTitle,
  isInteractionSummaryTitle,
  parseInteractionSummary,
  selectCrossAgentComments,
  summarizeCollaborationLinks,
} from "./agent-workflow";

function makeComment(
  id: string,
  createdAt: string,
  overrides: Partial<IssueComment> = {},
): IssueComment {
  return {
    id,
    companyId: "company-1",
    issueId: "issue-1",
    authorType: "agent",
    authorAgentId: "reviewer-1",
    authorUserId: null,
    body: id,
    presentation: null,
    metadata: null,
    createdAt: new Date(createdAt),
    updatedAt: new Date(createdAt),
    ...overrides,
  };
}

describe("selectCrossAgentComments", () => {
  it("keeps recent comments from agents other than the assignee", () => {
    const comments = [
      makeComment("missing-author", "2026-09-26T10:00:00Z", { authorAgentId: null, derivedAuthorAgentId: undefined }),
      makeComment("empty-author", "2026-09-26T10:00:00Z", { authorAgentId: "" }),
      makeComment("older-peer", "2026-09-20T10:00:00Z"),
      makeComment("assignee", "2026-09-24T10:00:00Z", { authorAgentId: "coder-1" }),
      makeComment("newer-peer", "2026-09-25T10:00:00Z"),
      makeComment("board", "2026-09-26T10:00:00Z", {
        authorType: "user",
        authorAgentId: null,
        authorUserId: "user-1",
      }),
      makeComment("deleted-peer", "2026-09-26T11:00:00Z", {
        deletedAt: new Date("2026-09-26T12:00:00Z"),
      }),
    ];

    expect(selectCrossAgentComments(comments, "coder-1").map((comment) => comment.id)).toEqual([
      "newer-peer",
      "older-peer",
    ]);
  });

  it("uses derived agent authorship and respects the preview limit", () => {
    const comments = [
      makeComment("first", "2026-09-23T10:00:00Z", {
        authorAgentId: null,
        derivedAuthorAgentId: "reviewer-1",
        createdAt: "2026-09-23T10:00:00Z" as unknown as Date,
      }),
      makeComment("second", "2026-09-24T10:00:00Z"),
    ];

    expect(selectCrossAgentComments(comments, "coder-1", 1).map((comment) => comment.id)).toEqual([
      "second",
    ]);
    expect(selectCrossAgentComments(comments, null)).toEqual([]);
    expect(selectCrossAgentComments(comments, "coder-1", 0)).toEqual([]);
  });

  it("summarizes visible collaboration between contributors and task owners", () => {
    expect(
      summarizeCollaborationLinks([
        {
          ownerAgentId: "coder-1",
          comments: [
            makeComment("research-1", "2026-09-25T10:00:00Z", {
              authorAgentId: "research-1",
            }),
            makeComment("research-2", "2026-09-25T11:00:00Z", {
              authorAgentId: "research-1",
            }),
            makeComment("owner", "2026-09-25T12:00:00Z", {
              authorAgentId: "coder-1",
            }),
          ],
        },
        {
          ownerAgentId: "trading-1",
          comments: [
            makeComment("coder-help", "2026-09-25T13:00:00Z", {
              authorAgentId: "coder-1",
            }),
          ],
        },
      ]),
    ).toEqual([
      { contributorAgentId: "research-1", ownerAgentId: "coder-1", contributionCount: 2 },
      { contributorAgentId: "coder-1", ownerAgentId: "trading-1", contributionCount: 1 },
    ]);
    expect(summarizeCollaborationLinks([], 0)).toEqual([]);
  });
});

describe("interaction summaries", () => {
  it("uses a stable task title and recognizes summary tasks", () => {
    const title = interactionSummaryTitle("leadership", "coding");
    expect(title).toBe("[Interaction summary] leadership -> coding");
    expect(isInteractionSummaryTitle(title)).toBe(true);
    expect(isInteractionSummaryTitle("Build the workflow desk")).toBe(false);
  });

  it("recognizes branch briefing tasks from the shared prefix", () => {
    expect(BRANCH_BRIEFING_PREFIX).toBe("[Branch briefing]");
    expect(isBranchBriefingTitle(`${BRANCH_BRIEFING_PREFIX} Coding`)).toBe(true);
    expect(isBranchBriefingTitle("Ship the workflow desk")).toBe(false);
  });

  it("does not treat a bare prefix without a subject as a briefing or summary", () => {
    // A title that is exactly the prefix is not a real briefing/summary task.
    expect(isBranchBriefingTitle(BRANCH_BRIEFING_PREFIX)).toBe(false);
    expect(isInteractionSummaryTitle(INTERACTION_SUMMARY_PREFIX)).toBe(false);
  });

  it("parses the plain-English contract and removes code from visible fields", () => {
    expect(parseInteractionSummary(`
## What they're discussing
The CEO asked Coding to make the workflow easier to understand.\n\n\`\`\`ts\nconst hidden = true;\n\`\`\`
## Why the other branch was involved
Coding owns the dashboard implementation.
## Decisions or advice
Use readable cards and keep evidence links optional.
## Next action and owner
Coding Lead will update the interaction panel.
`)).toEqual({
      discussion: "The CEO asked Coding to make the workflow easier to understand.",
      reason: "Coding owns the dashboard implementation.",
      decisions: "Use readable cards and keep evidence links optional.",
      nextAction: "Coding Lead will update the interaction panel.",
    });
  });

  it("rejects an unstructured raw technical comment", () => {
    expect(parseInteractionSummary("const result = await run();")).toBeNull();
  });
});
