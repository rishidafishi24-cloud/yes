export type WorkflowBranch = "leadership" | "coding" | "business" | "trading" | "research" | "memory" | "game" | "content";

/**
 * Titles of internally generated reporting tasks. These are bookkeeping, not
 * operator work, so consumers filter them out. Both the server (which creates
 * them) and the UI (which lists them) must agree, so the literals live here
 * rather than being repeated per package.
 */
export const INTERACTION_SUMMARY_PREFIX = "[Interaction summary]";
export const BRANCH_BRIEFING_PREFIX = "[Branch briefing]";

export function isInteractionSummaryTitle(title: string): boolean {
  return title.startsWith(`${INTERACTION_SUMMARY_PREFIX} `);
}

export function isBranchBriefingTitle(title: string): boolean {
  return title.startsWith(`${BRANCH_BRIEFING_PREFIX} `);
}

/** True for tasks the system generated for its own reporting rather than for an operator. */
export function isInternalReportingTitle(title: string): boolean {
  return isInteractionSummaryTitle(title) || isBranchBriefingTitle(title);
}

export function inferWorkflowBranch(agent: { name: string; role: string; title?: string | null; capabilities?: string | null; metadata?: Record<string, unknown> | null }): WorkflowBranch {
  const workflow = agent.metadata?.workflow;
  const explicit = workflow && typeof workflow === "object" && "branch" in workflow ? workflow.branch : null;
  if (typeof explicit === "string" && ["leadership", "coding", "business", "trading", "research", "memory", "game", "content"].includes(explicit)) return explicit as WorkflowBranch;
  const identity = [agent.name, agent.title, agent.role, agent.capabilities].filter(Boolean).join(" ").toLowerCase();
  if (agent.role === "ceo" || identity.includes(" ceo")) return "leadership";
  if (identity.includes("memory")) return "memory";
  if (identity.includes("trading") || identity.includes("market")) return "trading";
  if (identity.includes("business") || identity.includes("revenue")) return "business";
  if (identity.includes("content") || identity.includes("editorial")) return "content";
  if (identity.includes("game")) return "game";
  if (["coding", "code ", "coder", "engineer", "reviewer", "tester"].some((word) => identity.includes(word))) return "coding";
  return identity.includes("research") ? "research" : "coding";
}

export interface InteractionCheckpoint { eventId: string; sourceAt: string }
export interface InteractionReport {
  from: WorkflowBranch; to: WorkflowBranch; latest: InteractionCheckpoint;
  taskIds: string[]; taskId?: string; requested?: InteractionCheckpoint;
  completed?: InteractionCheckpoint; requestedAt?: string; dueAt: string;
  status: "pending" | "queued" | "ready" | "failed";
  wakePending?: boolean; wakeAttempts?: number; wakeRetryAt?: string; failure?: string;
}
export interface InteractionReportingState {
  version: 1; cursor: { at: string; id: string }; pairs: Record<string, InteractionReport>;
}
export function checkpointMarker(checkpoint: InteractionCheckpoint) {
  return `<!-- interaction-checkpoint:${checkpoint.eventId}:${checkpoint.sourceAt} -->`;
}
export function readCheckpoint(body: string): InteractionCheckpoint | null {
  const match = body.match(/<!-- interaction-checkpoint:([0-9a-f-]{36}):([^\s]+) -->/i);
  if (!match || !Number.isFinite(Date.parse(match[2]))) return null;
  return { eventId: match[1], sourceAt: match[2] };
}
export function hasInteractionFields(body: string) {
  return ["What they're discussing", "Why the other branch was involved", "Decisions or advice", "Next action and owner"].every((heading) => body.includes(`## ${heading}\n`));
}
export function matchesInteractionReply(body: string, request: InteractionCheckpoint) {
  const checkpoint = readCheckpoint(body);
  return checkpoint?.eventId === request.eventId && checkpoint.sourceAt === request.sourceAt && hasInteractionFields(body);
}
