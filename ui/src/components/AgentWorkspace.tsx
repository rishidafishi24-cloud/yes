import { useMemo, useState } from "react";
import { observedCollaboration } from "@/lib/observed-collaboration";
import { readCheckpoint, type InteractionReportingState } from "@paperclipai/shared/workflow-reporting";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Agent } from "@paperclipai/shared";
import { issuesApi } from "@/api/issues";
import { activityApi } from "@/api/activity";
import { Button } from "@/components/ui/button";
import { IssueStatusBadge } from "@/components/StatusBadge";
import { MarkdownBody } from "@/components/MarkdownBody";
import { Link } from "@/lib/router";
import { agentUrl, relativeTime } from "@/lib/utils";
import {
  INTERACTION_SUMMARY_PREFIX,
  WORKFLOW_BRANCHES,
  inferWorkflowBranch,
  interactionSummaryTitle,
  isInteractionSummaryTitle,
  parseInteractionSummary,
  type WorkflowBranchKey,
} from "@/lib/agent-workflow";

const VIEWS = ["Structure", "Dependencies", "Information Flow", "Tasks", "Activity"] as const;
type View = typeof VIEWS[number];
const RELATIONSHIPS: [WorkflowBranchKey, WorkflowBranchKey, string][] = [
  ["leadership", "coding", "Translate intent, agree architecture and delegation"],
  ["leadership", "business", "Priorities, efficiency and resource decisions"],
  ["leadership", "trading", "Objectives, constraints and risk decisions"],
  ["leadership", "research", "Resolve uncertainty with evidence"],
  ["leadership", "game", "Game direction, scope, delivery, and resource decisions"],
  ["leadership", "content", "Content goals, audience priorities, and tradeoffs"],
  ["business", "coding", "Build useful automation"],
  ["business", "research", "Investigate opportunities"],
  ["business", "trading", "Performance and resource allocation"],
  ["trading", "coding", "Data pipelines and testing infrastructure"],
  ["trading", "research", "Validate datasets and assumptions"],
  ["game", "coding", "One architecture and one owner for coupled systems"],
  ["game", "research", "Selective mechanics and design research"],
  ["game", "business", "Scope and monetization decisions"],
  ["coding", "research", "Selective technical evidence and experiments"],
  ["content", "coding", "Technical help when needed"],
  ["content", "research", "Evidence when relevant"],
  ...(["leadership", "coding", "business", "trading", "research", "game", "content"] as WorkflowBranchKey[])
    .map((key): [WorkflowBranchKey, WorkflowBranchKey, string] => [key, "memory", "Retrieve context; preserve verified lessons and decisions"]),
];

export function workflowBranch(agent: Agent): WorkflowBranchKey {
  const workflow = agent.metadata?.workflow as { branch?: string } | undefined;
  const configured = WORKFLOW_BRANCHES.find((b) => b.key === workflow?.branch);
  return configured?.key ?? inferWorkflowBranch(agent);
}

function branchColorClass(branch: WorkflowBranchKey) {
  return `branch-color-${branch}`;
}

function BranchLabel({ branch }: { branch: WorkflowBranchKey }) {
  const label = WORKFLOW_BRANCHES.find((item) => item.key === branch)?.label ?? branch;
  return <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${branchColorClass(branch)}`}>
    <span className="branch-dot h-2 w-2 rounded-full" aria-hidden="true" />
    <span className="branch-text">{label}</span>
  </span>;
}

function ReportingTree({ agents }: { agents: Agent[] }) {
  const ids = new Set(agents.map((a) => a.id));
  const visited = new Set<string>();
  function node(agent: Agent): React.ReactNode {
    if (visited.has(agent.id)) return null;
    visited.add(agent.id);
    const children = agents.filter((a) => a.reportsTo === agent.id && !visited.has(a.id));
    return <li key={agent.id} className="py-1">
      <div className={`branch-tint flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 ${branchColorClass(workflowBranch(agent))}`}>
        <Link to={agentUrl(agent)} className="font-medium hover:underline">{agent.name}</Link>
        <BranchLabel branch={workflowBranch(agent)} />
        <span className="text-xs text-muted-foreground">{agent.title || agent.role}</span>
        <span className="ml-auto text-xs text-muted-foreground">{agent.status}</span>
      </div>
      {children.length > 0 && <ul className="ml-4 border-l border-border pl-4">{children.map(node)}</ul>}
    </li>;
  }
  const roots = agents.filter((a) => !a.reportsTo || !ids.has(a.reportsTo));
  const trees = roots.map(node);
  // Keep malformed cycles visible without recursive loops or disappearing agents.
  const unattached = agents.filter((a) => !visited.has(a.id)).map(node);
  return <div className="space-y-3">
    <div className="rounded-md border border-border bg-muted px-3 py-2 font-medium">You · goals and priorities</div>
    <ul aria-label="Reporting tree" className="ml-4 border-l border-border pl-4">{trees}{unattached}</ul>
    {unattached.length > 0 && <p role="alert" className="text-sm text-destructive">Some reporting relationships contain a cycle. Review the agents above.</p>}
  </div>;
}

export function AgentWorkspace({ companyId, agents, initialView = "Structure" }: {
  companyId: string; agents: Agent[]; initialView?: View;
}) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>(initialView);
  const [selectedBranch, setSelectedBranch] = useState<WorkflowBranchKey>("leadership");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const agentsById = new Map(agents.map((a) => [a.id, a]));
  const summarizer = agents.find((agent) => {
    const builtIn = agent.metadata?.paperclipBuiltInAgent as { key?: string } | undefined;
    return builtIn?.key === "summarizer" || agent.name.toLowerCase() === "summarizer";
  });
  const tasksQuery = useQuery({
    queryKey: ["workspace-tasks", companyId],
    queryFn: () => issuesApi.list(companyId, { limit: 100, sortField: "updated", sortDir: "desc" }),
    enabled: view === "Dependencies" || view === "Tasks" || view === "Activity", refetchInterval: 15_000,
  });
  const activityQuery = useQuery({
    queryKey: ["workspace-activity", companyId],
    queryFn: () => activityApi.list(companyId, { limit: 30 }),
    enabled: view === "Activity", refetchInterval: 15_000,
  });
  const commentsQuery = useQuery({
    queryKey: ["workspace-comments", companyId, selectedTask],
    queryFn: () => issuesApi.listComments(selectedTask!, { order: "desc", limit: 20 }),
    enabled: view === "Tasks" && !!selectedTask, refetchInterval: 15_000,
  });
  const tasks = tasksQuery.data ?? [];
  const briefingTasks = tasks.filter((task) => isBranchBriefingTitle(task.title));
  const summaryTasksQuery = useQuery({
    queryKey: ["interaction-summary-tasks", companyId],
    queryFn: () => issuesApi.list(companyId, { q: INTERACTION_SUMMARY_PREFIX, limit: 100 }),
    enabled: view === "Dependencies",
    refetchInterval: 30_000,
  });
  const interactionSummaryTasks = (summaryTasksQuery.data ?? []).filter((task) => isInteractionSummaryTitle(task.title));
  const collaborationEvents = useQuery({
    queryKey: ["workspace-collaboration-events", companyId],
    queryFn: () => activityApi.list(companyId, { action: "issue.comment_added", entityType: "issue", limit: 500 }),
    enabled: view === "Dependencies" || view === "Activity",
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
  const briefingCommentQueries = useQueries({
    queries: briefingTasks.map((task) => ({
      queryKey: ["branch-briefing-comments", task.id],
      queryFn: () => issuesApi.listComments(task.id, { order: "desc", limit: 20 }),
      enabled: view === "Activity",
      refetchInterval: 15_000,
    })),
  });
  const interactionSummaryCommentQueries = useQueries({
    queries: interactionSummaryTasks.map((task) => ({
      queryKey: ["interaction-summary-comments", task.id],
      queryFn: () => issuesApi.listComments(task.id, { order: "desc", limit: 30 }),
      enabled: view === "Dependencies",
      refetchInterval: 15_000,
    })),
  });
  const refreshBriefing = useMutation({
    mutationFn: (taskId: string) => issuesApi.addComment(
      taskId,
      "Refresh this branch briefing now. Read current task status, recent activity, and relevant comments. Post a new plain-English briefing with: what is happening now, what changed, blockers or risks, the next action and owner, and links to the few source tasks that support the summary. Do not dump logs or code.",
      true,
    ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspace-tasks", companyId] });
    },
  });
  const commentFlow = { ...observedCollaboration(collaborationEvents.data ?? [], tasks, agents), loaded: collaborationEvents.isSuccess && tasksQuery.isSuccess };
  const summaryTaskByPair = useMemo(() => new Map(
    interactionSummaryTasks.map((task) => [task.title, task]),
  ), [interactionSummaryTasks]);
  const summaryCommentsByTask = useMemo(() => new Map(
    interactionSummaryTasks.map((task, index) => [task.id, interactionSummaryCommentQueries[index]]),
  ), [interactionSummaryCommentQueries, interactionSummaryTasks]);
  const visibleTasks = tasks.filter((task) => !isInteractionSummaryTitle(task.title));
  const shownTasks = visibleTasks.filter((t) => (status === "all" || t.status === status) && `${t.identifier} ${t.title}`.toLowerCase().includes(search.toLowerCase()));
  const task = tasks.find((t) => t.id === selectedTask);
  const branches = WORKFLOW_BRANCHES.map((b, i) => ({ ...b,
    agents: agents.filter((a) => workflowBranch(a) === b.key),
    x: 350 + 245 * Math.cos(i * Math.PI / 4 - Math.PI / 2),
    y: 210 + 160 * Math.sin(i * Math.PI / 4 - Math.PI / 2),
  }));
  const activeBranch = branches.find((b) => b.key === selectedBranch)!;
  const ownerName = (id: string | null) => id ? agentsById.get(id)?.name ?? "Agent outside this roster" : "Unassigned";
  const branchForAgent = (id: string | null | undefined) => {
    const agent = id ? agentsById.get(id) : undefined;
    return agent ? workflowBranch(agent) : null;
  };

  return <section className="space-y-4 pb-6" aria-label="Company workspace">
    <nav className="flex flex-wrap gap-1 border-b border-border pb-3" aria-label="Workspace views">
      {VIEWS.map((name) => <Button key={name} variant={view === name ? "secondary" : "ghost"} aria-pressed={view === name} onClick={() => setView(name)}>{name}</Button>)}
    </nav>
    <header>
      <h2 className="text-lg font-semibold">{view}</h2>
      <p className="text-sm text-muted-foreground">{view === "Structure" ? "Who reports to whom. Open an agent to see its role and work." : view === "Dependencies" ? "Select a branch to see who it can ask for help. Lines show the agreed collaboration model, not live messages." : view === "Information Flow" ? "How knowledge should move. This is the intended memory policy; transfers are not yet instrumented." : view === "Tasks" ? "Open a task card for the full thread, or inspect its latest feedback here." : "Recent recorded events and task statuses. In progress does not necessarily mean an agent is running."}</p>
    </header>
    {view === "Structure" && <ReportingTree agents={agents} />}
    {view === "Dependencies" && <><div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-md border border-border bg-card p-3 lg:col-span-2">
        <svg viewBox="0 0 700 420" role="img" aria-label={`Collaboration map focused on ${activeBranch.label}`} className="w-full text-border">
          {RELATIONSHIPS.filter(([a,b]) => a === selectedBranch || b === selectedBranch).map(([a,b]) => {
            const from = branches.find((v) => v.key === a)!; const to = branches.find((v) => v.key === b)!;
            return <line key={`${a}-${b}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="currentColor" strokeWidth="2" />;
          })}
          {branches.map((b) => <g key={b.key} role="button" tabIndex={0} aria-label={`Focus ${b.label}`} aria-pressed={selectedBranch === b.key} onClick={() => setSelectedBranch(b.key)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedBranch(b.key); } }} className={`cursor-pointer ${branchColorClass(b.key)}`}>
            <rect x={b.x - 70} y={b.y - 25} width="140" height="50" rx="8" strokeWidth={selectedBranch === b.key ? 3 : 2} className={selectedBranch === b.key ? "branch-svg-node-active" : "branch-svg-node"} />
            <text x={b.x} y={b.y} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-sm">{b.label}</text>
          </g>)}
        </svg>
        <div className="flex flex-wrap gap-1" aria-label="Choose branch">{branches.map((b) => <Button key={b.key} size="sm" variant={selectedBranch === b.key ? "secondary" : "ghost"} onClick={() => setSelectedBranch(b.key)}><BranchLabel branch={b.key} /></Button>)}</div>
      </div>
      <aside className={`branch-tint space-y-3 rounded-md border p-4 ${branchColorClass(activeBranch.key)}`}>
        <h3 className="font-semibold"><BranchLabel branch={activeBranch.key} /></h3><p className="text-sm text-muted-foreground">{activeBranch.purpose}</p>
        <p className="text-xs text-muted-foreground">{activeBranch.agents.length} configured agents · support is requested when useful</p>
        {RELATIONSHIPS.filter(([a,b]) => a === selectedBranch || b === selectedBranch).map(([a,b,why]) => <div key={`${a}-${b}`} className="border-t border-border pt-2"><p className="text-sm font-medium">↔ {branches.find((v) => v.key === (a === selectedBranch ? b : a))?.label}</p><p className="text-xs text-muted-foreground">{why}</p></div>)}
        {activeBranch.agents.map((a) => <Link key={a.id} to={agentUrl(a)} className="block text-sm hover:underline">{a.name} ↗</Link>)}
      </aside>
    </div>
      <section className="space-y-3 rounded-md border border-border p-4" aria-labelledby="observed-comments-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div><h3 id="observed-comments-heading" className="font-semibold">Recent observed collaboration</h3><p className="text-sm text-muted-foreground">Agent comments grouped by commenter → current task owner, not direct messages. Latest {collaborationEvents.data?.length ?? 0} comment events matched against {tasks.length} recent tasks. Reporting and briefing tasks are excluded.</p></div>
          <span className="text-sm font-medium">{commentFlow.loaded ? `${commentFlow.commentCount} peer comments` : "Loading comments…"}</span>
        </div>
        {collaborationEvents.isError || tasksQuery.isError ? <p role="alert" className="text-sm text-destructive">Collaboration data could not be loaded. Counts are incomplete.</p> : null}
        {summaryTasksQuery.isError ? <p role="alert" className="text-sm text-destructive">Could not load summary tasks. Evidence remains available.</p> : null}
        {commentFlow.unresolved > 0 && <p role="status" className="text-sm text-muted-foreground">{commentFlow.unresolved} unresolved events: their task or agent is outside the loaded window.</p>}
        {(collaborationEvents.data?.length ?? 0) >= 500 && <p className="text-sm text-muted-foreground">Showing the latest 500 events; older collaboration is outside this window.</p>}
        {commentFlow.loaded && commentFlow.branches.length === 0 ? <p className="text-sm text-muted-foreground">No agent has commented on another agent&apos;s task in this window.</p> : null}
        <div className="grid gap-3 lg:grid-cols-2">{commentFlow.branches.map((flow) => {
          const pairTitle = interactionSummaryTitle(flow.from, flow.to);
          const summaryTask = summaryTaskByPair.get(pairTitle);
          const commentsState = summaryTask ? summaryCommentsByTask.get(summaryTask.id) : undefined;
          const summaryComment = commentsState?.data?.find((comment) => {
            const authorId = comment.authorAgentId ?? comment.derivedAuthorAgentId;
            return !comment.deletedAt && authorId === summarizer?.id && parseInteractionSummary(comment.body);
          });
          const summary = summaryComment ? parseInteractionSummary(summaryComment.body) : null;
          const checkpoint = summaryComment ? readCheckpoint(summaryComment.body) : null;
          const reporting = summarizer?.metadata?.interactionReporting as InteractionReportingState | undefined;
          const report = reporting?.pairs?.[`${flow.from}:${flow.to}`];
          const isStale = !checkpoint || flow.latestCommentAt > Date.parse(checkpoint.sourceAt) || (report && (report.latest.eventId !== checkpoint.eventId || report.status !== "ready"));
          const participantNames = [...flow.agentIds]
            .map((id) => agentsById.get(id)?.name)
            .filter((name) => !!name)
            .join(", ");
          return <details key={`${flow.from}:${flow.to}`} className={`branch-tint rounded-md border p-4 ${branchColorClass(flow.from)}`}>
            <summary className="cursor-pointer list-none">
              <span className="flex flex-wrap items-center gap-2"><BranchLabel branch={flow.from} /><span aria-hidden="true">→</span><BranchLabel branch={flow.to} /><strong className="ml-auto">{flow.count} comment{flow.count === 1 ? "" : "s"}</strong></span>
              <span className="mt-1 block text-xs text-muted-foreground">{participantNames || "Agents unavailable"} · {flow.taskIds.size} task{flow.taskIds.size === 1 ? "" : "s"}</span>
            </summary>
            <div className="mt-4 space-y-3 border-t border-border pt-3 text-sm">
              {!summarizer ? <div><p className="font-medium">Could not summarize</p><p className="text-muted-foreground">The Summarizer needs to be enabled for this company. Counts and evidence remain available.</p></div>
                : commentsState?.isError || summaryTask?.status === "blocked" || report?.status === "failed" ? <div><p className="font-medium">Could not summarize</p><p className="text-muted-foreground">{report?.failure ?? "The reporting agent could not read or explain this conversation yet."}</p></div>
                : !summary || isStale ? <div><p className="font-medium">Summary pending</p><p className="text-muted-foreground">The reporting agent is turning the latest discussion into plain English.</p></div>
                : <>
                  <div><p className="font-medium">What they&apos;re discussing</p><p className="mt-1 whitespace-pre-line text-muted-foreground">{summary.discussion}</p></div>
                  <div><p className="font-medium">Why the other branch was involved</p><p className="mt-1 whitespace-pre-line text-muted-foreground">{summary.reason}</p></div>
                  <div><p className="font-medium">Decisions or advice</p><p className="mt-1 whitespace-pre-line text-muted-foreground">{summary.decisions || "No clear decision has been recorded yet."}</p></div>
                  <div><p className="font-medium">Next action and owner</p><p className="mt-1 whitespace-pre-line text-muted-foreground">{summary.nextAction || "No next owner has been recorded yet."}</p></div>
                  <p className="text-xs text-muted-foreground">Updated {relativeTime(summaryComment!.createdAt)}</p>
                </>}
              <details className="rounded-md border border-border bg-card p-3">
                <summary className="cursor-pointer text-xs font-medium">View evidence · {flow.taskIds.size} task{flow.taskIds.size === 1 ? "" : "s"}</summary>
                {summaryTask && <Link className="text-xs hover:underline" to={`/issues/${summaryTask.identifier ?? summaryTask.id}`}>Open reporting task →</Link>}
                <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">{[...flow.taskIds].slice(0, 10).map((taskId) => {
                  const related = tasks.find((task) => task.id === taskId);
                  return related ? <Link key={taskId} to={`/issues/${related.identifier ?? related.id}`} className="hover:text-foreground hover:underline">{related.identifier} · {related.title}</Link> : null;
                })}</div>
              </details>
            </div>
          </details>;
        })}</div>
        {commentFlow.agents.length > 0 ? <details className="rounded-md border border-border bg-card p-3" open>
          <summary className="cursor-pointer text-sm font-medium">Who commented on whom</summary>
          <div className="mt-3 divide-y divide-border">{commentFlow.agents.map((flow) => {
            const commenter = agentsById.get(flow.fromAgentId);
            const owner = agentsById.get(flow.toAgentId);
            return <div key={`${flow.fromAgentId}:${flow.toAgentId}`} className="space-y-1 py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2 text-sm"><Link to={commenter ? agentUrl(commenter) : "/agents/all"} className="font-medium hover:underline">{commenter?.name ?? "Unknown agent"}</Link><BranchLabel branch={flow.from} /><span>commented on</span><Link to={owner ? agentUrl(owner) : "/agents/all"} className="font-medium hover:underline">{owner?.name ?? "Unknown owner"}</Link><BranchLabel branch={flow.to} /><strong className="ml-auto">{flow.count} time{flow.count === 1 ? "" : "s"}</strong></div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">{[...flow.taskIds].slice(0, 5).map((taskId) => { const related = tasks.find((task) => task.id === taskId); return related ? <Link key={taskId} to={`/issues/${related.identifier ?? related.id}`} className="hover:text-foreground hover:underline">{related.identifier} · {related.title}</Link> : null; })}</div>
            </div>;
          })}</div>
        </details> : null}
      </section>
    </>}
    {view === "Information Flow" && <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {[['1 · Work and evidence', 'Tasks, observations, research and bounded experiments.'], ['2 · Branch memory', 'Keep project decisions, outcomes and failed experiments with their sources.'], ['3 · Memory Lead', 'Promote verified reusable lessons into shared company knowledge.']].map(([title, body]) => <div key={title} className="rounded-md border border-border bg-card p-4"><h3 className="font-medium">{title}</h3><p className="mt-2 text-sm text-muted-foreground">{body}</p></div>)}
      </div>
      <div className="rounded-md border border-border p-4 text-sm">Work → branch memory → verification → Memory Lead → reusable knowledge → next task<br /><span className="text-muted-foreground">Research → evidence or experiment → CEO + Coding review → adopt or reject. Findings do not automatically change production.</span></div>
      <div className="grid gap-3 md:grid-cols-2">{branches.filter((b) => !["memory", "leadership"].includes(b.key)).map((b) => {
        const specialist = agents.find((a) => (a.metadata?.workflow as { memoryFor?: string } | undefined)?.memoryFor === b.key);
        return <div key={b.key} className={`branch-tint rounded-md border p-3 ${branchColorClass(b.key)}`}><h3 className="flex items-center gap-2 text-sm font-semibold"><BranchLabel branch={b.key} /> ↔ {specialist?.name ?? "Branch memory not configured"}</h3><p className="mt-1 text-xs text-muted-foreground">Retrieve relevant context before work; save verified decisions and lessons afterward.</p>{specialist && <Link to={agentUrl(specialist)} className="mt-2 block text-sm hover:underline">Open memory owner ↗</Link>}</div>;
      })}</div>
    </div>}
    {(view === "Tasks" || view === "Activity") && tasksQuery.isPending && <p role="status">Loading task statuses…</p>}
    {(view === "Tasks" || view === "Activity") && tasksQuery.isError && <p role="alert" className="text-destructive">Could not load tasks. {tasksQuery.error.message}</p>}
    {view === "Tasks" && <>
      <div className="flex flex-wrap items-center gap-3">
        <input aria-label="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks…" className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <select aria-label="Task status" value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">{["all", "backlog", "todo", "in_progress", "in_review", "blocked", "done", "cancelled"].map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select>
        <span className="text-xs text-muted-foreground">{shownTasks.length} of {visibleTasks.length} recent tasks · up to 100 · refreshes every 15s</span>
      </div>
      {tasksQuery.isSuccess && shownTasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks match this view.</p>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{shownTasks.map((t) => {
        const ownerBranch = branchForAgent(t.assigneeAgentId);
        return <article key={t.id} className={`space-y-3 rounded-md border p-4 ${ownerBranch ? `branch-tint ${branchColorClass(ownerBranch)}` : "border-border bg-card"}`}>
          <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs text-muted-foreground">{t.identifier}</span><IssueStatusBadge status={t.status} /></div>
          <Link to={`/issues/${t.identifier ?? t.id}`} className="block font-medium hover:underline">{t.title} ↗</Link>
          <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">Owner: {ownerName(t.assigneeAgentId)} {ownerBranch ? <BranchLabel branch={ownerBranch} /> : null} · {relativeTime(t.updatedAt)}</p>
          <Button size="sm" variant="outline" aria-pressed={selectedTask === t.id} onClick={() => setSelectedTask(selectedTask === t.id ? null : t.id)}>Inspect feedback · {t.identifier}</Button>
        </article>;
      })}</div>
      {task && <aside className="space-y-3 rounded-md border border-border bg-muted p-4" aria-label="Task feedback">
        <h3 className="font-semibold">Feedback about {task.identifier}: {task.title}</h3><p className="text-sm text-muted-foreground">Owner: {ownerName(task.assigneeAgentId)}. Latest 20 comments; labels identify who is contributing, not whether the claim is verified.</p>
        {commentsQuery.isPending && <p role="status">Loading comments…</p>}{commentsQuery.isError && <p role="alert" className="text-destructive">Could not load task feedback.</p>}
        {commentsQuery.isSuccess && commentsQuery.data.filter((c) => !c.deletedAt).length === 0 && <p>No feedback recorded yet.</p>}
        {commentsQuery.data?.filter((c) => !c.deletedAt).map((c) => { const id = c.authorAgentId ?? c.derivedAuthorAgentId; const authorBranch = branchForAgent(id); return <details key={c.id} className={`rounded-md border p-3 ${authorBranch ? `branch-tint ${branchColorClass(authorBranch)}` : "border-border bg-card"}`}><summary className="cursor-pointer text-sm"><span className="font-medium">{id ? ownerName(id) : c.authorType === "user" ? "You / board" : "System"}</span> {authorBranch ? <BranchLabel branch={authorBranch} /> : null} · {id === task.assigneeAgentId ? "Owner update" : id ? "Peer input" : "Task comment"} · {relativeTime(c.createdAt)}<span className="mt-1 block truncate text-muted-foreground">{c.body}</span></summary><p className="mt-3 whitespace-pre-wrap break-words text-sm">{c.body}</p></details>; })}
      </aside>}
    </>}
    {view === "Activity" && <>
      <section className="space-y-3" aria-labelledby="branch-briefings-heading">
        <div>
          <h3 id="branch-briefings-heading" className="font-semibold">AI branch briefings</h3>
          <p className="text-sm text-muted-foreground">Plain-English agent summaries. Each briefing links to its source task so you can inspect the evidence only when needed.</p>
          {refreshBriefing.isError ? <p role="alert" className="mt-2 text-sm text-destructive">The refresh request failed: {refreshBriefing.error.message}</p> : null}
        </div>
        <div className="grid gap-3 lg:grid-cols-2">{WORKFLOW_BRANCHES.map((branch) => {
          const index = briefingTasks.findIndex((task) => task.title.toLowerCase().includes(branch.label.toLowerCase()));
          const briefingTask = index >= 0 ? briefingTasks[index] : undefined;
          const commentsQuery = index >= 0 ? briefingCommentQueries[index] : undefined;
          const summary = commentsQuery?.data?.find((comment) => comment.authorType === "agent" && !comment.deletedAt);
          const branchAgentIds = new Set(agents.filter((agent) => workflowBranch(agent) === branch.key).map((agent) => agent.id));
          const branchTasks = tasks.filter((task) => !isBranchBriefingTitle(task.title) && !isInteractionSummaryTitle(task.title) && task.assigneeAgentId && branchAgentIds.has(task.assigneeAgentId));
          const activeTasks = branchTasks.filter((task) => !["done", "cancelled"].includes(task.status));
          const blockedTasks = branchTasks.filter((task) => task.status === "blocked");
          const latestTask = branchTasks[0];
          return <article key={branch.key} className={`branch-tint space-y-3 rounded-md border p-4 ${branchColorClass(branch.key)}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><h4 className="font-medium"><BranchLabel branch={branch.key} /></h4><p className="text-xs text-muted-foreground">{branch.purpose}</p></div>
              {briefingTask ? <IssueStatusBadge status={briefingTask.status} /> : null}
            </div>
            {!briefingTask ? <p className="text-sm text-muted-foreground">Briefing task is not configured yet.</p>
              : commentsQuery?.isPending ? <p role="status" className="text-sm text-muted-foreground">The branch agent is preparing its first summary…</p>
              : commentsQuery?.isError ? <p role="alert" className="text-sm text-destructive">The latest briefing could not be loaded.</p>
              : summary ? <div className="max-h-80 overflow-y-auto text-sm"><MarkdownBody>{summary.body}</MarkdownBody></div>
              : <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">The AI briefing is still being prepared. Here is a live snapshot meanwhile.</p>
                <p><span className="font-medium">Right now:</span> {activeTasks.length} active task{activeTasks.length === 1 ? "" : "s"} across {branchAgentIds.size} agent{branchAgentIds.size === 1 ? "" : "s"}.</p>
                <p><span className="font-medium">Blocked:</span> {blockedTasks.length ? blockedTasks.map((task) => task.identifier ?? task.title).join(", ") : "No task is marked blocked."}</p>
                <p><span className="font-medium">Latest:</span> {latestTask ? <Link to={`/issues/${latestTask.identifier ?? latestTask.id}`} className="hover:underline">{latestTask.identifier} · {latestTask.title}</Link> : "No branch work is recorded."}</p>
              </div>}
            {briefingTask ? <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
              <span>{summary ? `Updated ${relativeTime(summary.createdAt)}` : `Task updated ${relativeTime(briefingTask.updatedAt)}`}</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={refreshBriefing.isPending} onClick={() => refreshBriefing.mutate(briefingTask.id)}>{refreshBriefing.isPending && refreshBriefing.variables === briefingTask.id ? "Requesting…" : "Refresh summary"}</Button>
                <Link to={`/issues/${briefingTask.identifier ?? briefingTask.id}`} className="font-medium text-foreground hover:underline">Open evidence task ↗</Link>
              </div>
            </div> : null}
          </article>;
        })}</div>
      </section>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{["in_progress", "in_review", "blocked", "done"].map((s) => <div key={s} className="rounded-md border border-border p-3"><p className="text-xs capitalize text-muted-foreground">{s.replaceAll("_", " ")}</p><p className="text-xl font-semibold">{tasksQuery.isSuccess ? tasks.filter((t) => t.status === s).length : "—"}</p></div>)}</div>
      <p className="text-xs text-muted-foreground">Counts cover the latest 100 tasks. Showing up to 30 recorded events; refreshes every 15s.</p>
      {activityQuery.isPending && <p role="status">Loading activity…</p>}{activityQuery.isError && <p role="alert" className="text-destructive">Could not load activity. {activityQuery.error.message}</p>}
      {activityQuery.isSuccess && !activityQuery.data.length && <p>No activity recorded yet.</p>}
      <ol className="divide-y divide-border">{activityQuery.data?.map((event) => {
        const linkedTask = tasks.find((t) => t.id === event.entityId);
        const linkedAgent = agentsById.get(event.entityId);
        return <li key={event.id} className="flex flex-wrap items-start justify-between gap-2 py-3"><div><p className="text-sm font-medium">{event.action.replaceAll(/[._]/g, " ")}</p><p className="text-xs text-muted-foreground">{event.actorType === "agent" ? ownerName(event.actorId) : event.actorType === "user" ? "You / board" : event.actorType}</p>{event.entityType === "issue" ? <Link to={`/issues/${linkedTask?.identifier ?? event.entityId}`} className="text-sm hover:underline">{linkedTask ? `${linkedTask.identifier} · ${linkedTask.title}` : "Open related task"} ↗</Link> : linkedAgent ? <Link to={agentUrl(linkedAgent)} className="text-sm hover:underline">{linkedAgent.name} ↗</Link> : <span className="text-xs text-muted-foreground">{event.entityType}</span>}</div><time className="text-xs text-muted-foreground">{relativeTime(event.createdAt)}</time></li>;
      })}</ol>
    </>}
  </section>;
}
