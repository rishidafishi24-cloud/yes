import type { ActivityEvent, Agent, Issue } from "@paperclipai/shared";
import { inferWorkflowBranch, isBranchBriefingTitle, isInteractionSummaryTitle, type WorkflowBranchKey } from "./agent-workflow";

export interface ObservedFlow {
  from: WorkflowBranchKey; to: WorkflowBranchKey; count: number;
  taskIds: Set<string>; agentIds: Set<string>; latestCommentAt: number;
  fromAgentId: string; toAgentId: string;
}

export function observedCollaboration(events: ActivityEvent[], tasks: Issue[], agents: Agent[]) {
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  const agentsById = new Map(agents.map((agent) => [agent.id, agent]));
  const branches = new Map<string, ObservedFlow>();
  const people = new Map<string, ObservedFlow>();
  const seen = new Set<string>();
  let unresolved = 0;
  for (const event of events) {
    if (event.action !== "issue.comment_added" || event.entityType !== "issue" || !event.agentId) continue;
    const commentId = event.details?.commentId;
    if (typeof commentId !== "string" || seen.has(commentId)) continue;
    seen.add(commentId);
    const task = tasksById.get(event.entityId);
    if (!task) { unresolved++; continue; }
    if (task.conversationAgentId || isBranchBriefingTitle(task.title) || isInteractionSummaryTitle(task.title)) continue;
    const author = agentsById.get(event.agentId);
    const owner = task.assigneeAgentId ? agentsById.get(task.assigneeAgentId) : undefined;
    if (!author || !owner) { unresolved++; continue; }
    if (author.id === owner.id) continue;
    const from = inferWorkflowBranch(author), to = inferWorkflowBranch(owner);
    if (from === to) continue;
    for (const [map, key] of [[branches, `${from}:${to}`], [people, `${author.id}:${owner.id}`]] as const) {
      const flow = map.get(key) ?? { from, to, count: 0, taskIds: new Set<string>(), agentIds: new Set<string>(), latestCommentAt: 0, fromAgentId: author.id, toAgentId: owner.id };
      flow.count++;
      flow.taskIds.add(task.id);
      flow.agentIds.add(author.id); flow.agentIds.add(owner.id);
      flow.latestCommentAt = Math.max(flow.latestCommentAt, new Date(event.createdAt).getTime());
      map.set(key, flow);
    }
  }
  return { branches: [...branches.values()].sort((a, b) => b.count - a.count), agents: [...people.values()].sort((a, b) => b.count - a.count), commentCount: [...people.values()].reduce((sum, flow) => sum + flow.count, 0), unresolved };
}
