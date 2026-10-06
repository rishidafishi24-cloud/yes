import type { Agent, IssueComment } from "@paperclipai/shared";
export { inferWorkflowBranch } from "@paperclipai/shared/workflow-reporting";
import {
  inferWorkflowBranch,
  INTERACTION_SUMMARY_PREFIX,
} from "@paperclipai/shared/workflow-reporting";

export type WorkflowBranchKey =
  | "leadership"
  | "coding"
  | "business"
  | "trading"
  | "research"
  | "memory"
  | "game"
  | "content";

export const WORKFLOW_BRANCHES: Array<{
  key: WorkflowBranchKey;
  label: string;
  purpose: string;
}> = [
  { key: "leadership", label: "Direction", purpose: "Intent, priorities, and tradeoffs" },
  { key: "coding", label: "Coding", purpose: "Architecture, implementation, and debugging" },
  { key: "business", label: "Business", purpose: "Efficiency, revenue, and resource use" },
  { key: "trading", label: "Trading", purpose: "Strategy, statistics, data, and risk" },
  { key: "research", label: "Research", purpose: "Evidence, alternatives, and uncertainty" },
  { key: "memory", label: "Memory", purpose: "Durable project and company knowledge" },
  { key: "game", label: "Game", purpose: "Game systems under shared coding architecture" },
  { key: "content", label: "Content", purpose: "Audience, publishing, and performance" },
];

export interface CollaborationLink {
  contributorAgentId: string;
  ownerAgentId: string;
  contributionCount: number;
}

export interface TaskCollaboration {
  ownerAgentId: string;
  comments: IssueComment[];
}

export interface InteractionSummaryFields {
  discussion: string;
  reason: string;
  decisions: string;
  nextAction: string;
}

export {
  INTERACTION_SUMMARY_PREFIX,
  BRANCH_BRIEFING_PREFIX,
  isInteractionSummaryTitle,
  isBranchBriefingTitle,
} from "@paperclipai/shared/workflow-reporting";

export function interactionSummaryTitle(from: WorkflowBranchKey, to: WorkflowBranchKey) {
  return `${INTERACTION_SUMMARY_PREFIX} ${from} -> ${to}`;
}

function cleanSummaryText(value: string) {
  return value
    .replace(/<!-- interaction-checkpoint:[\s\S]*?-->/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]+`/g, "technical detail")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*|__/g, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Parse the intentionally small, plain-English contract used by interaction briefing tasks. */
export function parseInteractionSummary(body: string): InteractionSummaryFields | null {
  const withoutCode = body.replace(/```[\s\S]*?```/g, "");
  const heading = /(?:^|\n)\s*(?:#{1,6}\s*)?(?:\*\*)?(What (?:they(?:'|’)?re|the branches are) discussing|Why (?:the other branch|this branch) was involved|Decisions or advice|Next action(?: and owner)?)(?:\*\*)?\s*:?\s*(?:\n|$)/gi;
  const matches = [...withoutCode.matchAll(heading)];
  if (matches.length === 0) return null;

  const sections = new Map<string, string>();
  for (const [index, match] of matches.entries()) {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? withoutCode.length;
    sections.set(match[1]!.toLowerCase(), cleanSummaryText(withoutCode.slice(start, end)));
  }
  const find = (prefix: string) =>
    [...sections.entries()].find(([label]) => label.startsWith(prefix))?.[1] ?? "";
  const result = {
    discussion: find("what "),
    reason: find("why "),
    decisions: find("decisions"),
    nextAction: find("next action"),
  };
  return result.discussion && result.reason ? result : null;
}

function commentAuthorAgentId(comment: IssueComment): string | null {
  return comment.authorAgentId ?? comment.derivedAuthorAgentId ?? null;
}

export function selectCrossAgentComments(
  comments: IssueComment[],
  assigneeAgentId: string | null,
  limit = 6,
): IssueComment[] {
  if (!assigneeAgentId || limit <= 0) return [];

  return comments
    .filter((comment) => {
      const authorAgentId = commentAuthorAgentId(comment);
      return (
        comment.deletedAt == null &&
        comment.authorType === "agent" &&
        typeof authorAgentId === "string" &&
        authorAgentId.length > 0 &&
        authorAgentId !== assigneeAgentId
      );
    })
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    )
    .slice(0, limit);
}

export function summarizeCollaborationLinks(
  taskCollaborations: TaskCollaboration[],
  limit = 6,
): CollaborationLink[] {
  if (limit <= 0) return [];

  const counts = new Map<string, CollaborationLink>();
  for (const task of taskCollaborations) {
    const peerComments = selectCrossAgentComments(
      task.comments,
      task.ownerAgentId,
      Number.MAX_SAFE_INTEGER,
    );
    for (const comment of peerComments) {
      const contributorAgentId = commentAuthorAgentId(comment);
      if (!contributorAgentId) continue;
      const key = `${contributorAgentId}:${task.ownerAgentId}`;
      const existing = counts.get(key);
      counts.set(key, {
        contributorAgentId,
        ownerAgentId: task.ownerAgentId,
        contributionCount: (existing?.contributionCount ?? 0) + 1,
      });
    }
  }

  return [...counts.values()]
    .sort(
      (left, right) =>
        right.contributionCount - left.contributionCount ||
        left.contributorAgentId.localeCompare(right.contributorAgentId) ||
        left.ownerAgentId.localeCompare(right.ownerAgentId),
    )
    .slice(0, limit);
}
