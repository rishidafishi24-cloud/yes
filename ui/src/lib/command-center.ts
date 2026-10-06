import type { Agent, Issue } from "@paperclipai/shared";
import { isBranchBriefingTitle, isInteractionSummaryTitle } from "./agent-workflow";

export function operationalTasks(tasks: Issue[]) {
  return tasks.filter((task) => !task.conversationAgentId && !isInteractionSummaryTitle(task.title) && !isBranchBriefingTitle(task.title));
}

export function projectParticipants(agents: Agent[], tasks: Issue[], leadAgentId?: string | null) {
  const ids = new Set(tasks.map((task) => task.assigneeAgentId).filter(Boolean));
  if (leadAgentId) ids.add(leadAgentId);
  return agents.filter((agent) => ids.has(agent.id));
}

/** Project context accompanies each message; switching never reassigns the conversation. */
export function contextualMessage(body: string, project?: { id: string; name: string } | null) {
  return project ? `Project context: ${project.name} (${project.id})\n\n${body.trim()}` : body.trim();
}

export function activitySentence(action: string) {
  const labels: Record<string, string> = {
    "issue.created": "Created a task", "issue.updated": "Updated a task",
    "issue.comment_added": "Added to the discussion", "issue.checked_out": "Started work on a task",
    "heartbeat.run.started": "Started working", "heartbeat.run.succeeded": "Finished a run",
    "heartbeat.run.failed": "A run needs attention", "agent.created": "Joined the team",
  };
  return labels[action] ?? "Recorded an update";
}

export function ownerFacingMessage(body: string) {
  return body.replace(/```[\s\S]*?(?:```|$)/g, "\n[Technical details are available in the full conversation.]\n");
}
