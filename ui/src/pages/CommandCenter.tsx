import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import type { Agent, Issue, Project } from "@paperclipai/shared";
import { ArrowUpRight, BookOpen, Bot, CircleDot, FolderOpen, Home, MessageSquare, Network, Plus, Settings, Sparkles } from "lucide-react";
import { Link, useSearchParams } from "@/lib/router";
import { agentsApi } from "@/api/agents";
import { agentChatsApi } from "@/api/agentChats";
import { authApi } from "@/api/auth";
import { projectsApi } from "@/api/projects";
import { issuesApi } from "@/api/issues";
import { activityApi } from "@/api/activity";
import { summarySlotsApi } from "@/api/summarySlots";
import { useCompany } from "@/context/CompanyContext";
import { useDialogActions } from "@/context/DialogContext";
import { useBreadcrumbs } from "@/context/BreadcrumbContext";
import { useAgentChatEnabled } from "@/hooks/useAgentChatEnabled";
import { usePublishSharedQueryData, useSharedPollingQuery } from "@/hooks/useSharedPolling";
import { queryKeys } from "@/lib/queryKeys";
import { agentUrl, relativeTime } from "@/lib/utils";
import { contextualMessage, operationalTasks, projectParticipants, activitySentence, ownerFacingMessage } from "@/lib/command-center";
import { inferWorkflowBranch } from "@/lib/agent-workflow";
import { Button } from "@/components/ui/button";
import { ChatComposer } from "@/components/ChatComposer";
import { MarkdownBody } from "@/components/MarkdownBody";
import { IssueStatusBadge } from "@/components/StatusBadge";

/** One cross-tab polling owner per resource; live events still invalidate shared keys. */
function useWorkspaceFeed<T>(companyId: string | null, key: QueryKey, fetch: () => Promise<T>, enabled = true) {
  const poll = useSharedPollingQuery<T>({ companyId, resourceKey: JSON.stringify(key), queryKey: key, enabled: enabled && !!companyId, refetchInterval: 30_000, leaderOnly: true });
  const query = useQuery({ queryKey: key, queryFn: fetch, enabled: poll.enabled, refetchInterval: poll.refetchInterval });
  usePublishSharedQueryData(poll, query.data, query.dataUpdatedAt);
  return query;
}

function AgentMark({ agent }: { agent: Agent }) {
  return <span className={`command-avatar branch-color-${inferWorkflowBranch(agent)}`} aria-hidden="true">{agent.name.slice(0, 2).toUpperCase()}</span>;
}

export function CommandNavigation() {
  const { selectedCompanyId } = useCompany();
  const [params] = useSearchParams();
  const projects = useQuery({ queryKey: queryKeys.projects.list(selectedCompanyId!), queryFn: () => projectsApi.list(selectedCompanyId!), enabled: !!selectedCompanyId });
  const agents = useQuery({ queryKey: queryKeys.agents.list(selectedCompanyId!), queryFn: () => agentsApi.list(selectedCompanyId!), enabled: !!selectedCompanyId });
  const ceo = agents.data?.find((agent) => agent.role === "ceo");
  return <nav className="command-nav" aria-label="Company workspace">
    <Link to="/command" className="command-brand"><Network /> <span>Paperclip<small>Ideas into real work</small></span></Link>
    <Link to="/command" className="command-nav-link"><Home /> Home</Link>
    {ceo && <Link to={`/command?agent=${ceo.id}`} className="command-nav-link"><MessageSquare /> CEO</Link>}
    <Link to="/agents/all" className="command-nav-link"><Bot /> Leads & agents</Link>
    <Link to="/projects" className="command-nav-link"><FolderOpen /> All projects</Link>
    <p className="command-eyebrow">Projects</p>
    {projects.isError && <p role="alert">Could not load projects.</p>}
    {projects.data?.map((project) => <Link key={project.id} to={`/command?project=${project.id}${project.leadAgentId ? `&agent=${project.leadAgentId}` : ""}`} aria-current={params.get("project") === project.id ? "page" : undefined} className="command-project-link"><FolderOpen /><span>{project.name}<small>{project.status.replaceAll("_", " ")}</small></span></Link>)}
    {projects.data?.length === 0 && <p className="text-sm text-muted-foreground">No projects yet.</p>}
    <p className="command-eyebrow">Brain · memory & learning</p>
    {agents.data?.filter((agent) => /memory|learning|reflection|study/i.test(`${agent.name} ${agent.title}`)).map((agent) => <Link key={agent.id} to={`/command?agent=${agent.id}`} className="command-nav-link"><BookOpen />{agent.name}</Link>)}
    <Link to="/activity" className="command-nav-link"><CircleDot /> Activity</Link>
    <Link to="/company/settings" className="command-nav-link"><Settings /> Settings</Link>
    <Link to="/dashboard" className="command-nav-link"><ArrowUpRight /> Metrics & controls</Link>
  </nav>;
}

function Conversation({ companyId, agent, project, team }: { companyId: string; agent: Agent; project: Project | null; team: Agent[] }) {
  const client = useQueryClient();
  const { enabled, loaded } = useAgentChatEnabled();
  const session = useQuery({ queryKey: queryKeys.auth.session, queryFn: () => authApi.getSession() });
  const userId = session.data?.user?.id ?? session.data?.session?.userId ?? null;
  const chatKey = queryKeys.agentChats.detail(companyId, userId, agent.id);
  const chat = useQuery({ queryKey: chatKey, queryFn: () => agentChatsApi.get(companyId, agent.id), enabled: enabled && session.isSuccess });
  const [draft, setDraft] = useState("");
  const receipt = useRef<{ body: string; id: string } | null>(null);
  const comments = useWorkspaceFeed(companyId, ["issues", "comments", chat.data?.id, "command", userId], () => issuesApi.listComments(chat.data!.id, { order: "desc", limit: 40 }), !!chat.data);
  const send = useMutation({
    mutationFn: async (text: string) => {
      const body = contextualMessage(text, project);
      if (receipt.current && receipt.current.body !== body) throw new Error("Retry the previous message or open the full conversation to confirm it before changing your draft.");
      receipt.current ??= { body, id: crypto.randomUUID() };
      const issue = chat.data ?? await agentChatsApi.ensure(companyId, agent.id);
      client.setQueryData(chatKey, issue);
      await issuesApi.addComment(issue.id, body, undefined, undefined, undefined, receipt.current.id);
      return issue.id;
    },
    onSuccess: async (issueId) => {
      receipt.current = null;
      setDraft("");
      await client.invalidateQueries({ queryKey: queryKeys.issues.comments(issueId) });
    },
  });
  const messages = [...(comments.data ?? [])].filter((comment) => !comment.deletedAt).reverse();
  return <section className="command-conversation" aria-label={`Conversation with ${agent.name}`}>
    <header className="command-agent-header"><AgentMark agent={agent} /><div><h2>{agent.name}</h2><p>{agent.title || agent.role} · {agent.status}</p></div><Link to={`/chats/${agent.id}`} className="ml-auto text-sm text-muted-foreground">Full conversation <ArrowUpRight className="inline size-4" /></Link></header>
    <div className="command-messages" aria-live="polite" aria-busy={comments.isFetching}>
      {!loaded || session.isPending || (enabled && chat.isPending) ? <p className="text-muted-foreground">Loading conversation…</p> : null}
      {loaded && !enabled && <div className="command-empty"><MessageSquare /><h2>Talk directly to your CEO or a lead</h2><p>Persistent Agent Chat is currently disabled. Enable it to send messages here. Tasks and project navigation are already available.</p><Link to="/company/settings/instance/experimental">Open experimental settings →</Link></div>}
      {session.isError || chat.isError || comments.isError ? <p role="alert" className="text-destructive">Could not load the conversation. <Button variant="outline" onClick={() => { void session.refetch(); void chat.refetch(); void comments.refetch(); }}>Retry</Button></p> : null}
      {enabled && chat.isSuccess && (!chat.data || comments.isSuccess) && messages.length === 0 && <div className="command-empty"><Sparkles /><h2>What would you like to work on?</h2><p>Ask {agent.name} for a plan, a progress update, or help with a decision.</p><div className="flex flex-wrap justify-center gap-2">{["Give me a plain-English progress update.", "What needs my attention?", "Help me plan the next milestone."].map((prompt) => <Button key={prompt} variant="outline" onClick={() => setDraft(prompt)}>{prompt}</Button>)}</div></div>}
      {messages.map((comment) => <article key={comment.id} className={`command-message ${comment.authorType === "user" ? "command-message-user" : ""}`}><p className="command-message-meta">{comment.authorType === "user" ? "You / board" : comment.authorType === "agent" ? team.find((member) => member.id === (comment.authorAgentId ?? comment.derivedAuthorAgentId))?.name ?? "Agent" : "System"} · {relativeTime(comment.createdAt)}</p><div className="command-bubble"><MarkdownBody>{ownerFacingMessage(comment.body)}</MarkdownBody></div></article>)}
      {messages.length >= 40 && <Link to={`/chats/${agent.id}`} className="text-sm text-muted-foreground">Showing the latest 40 messages · Open full history</Link>}
    </div>
    <div className="command-compose">
      {send.isError && <p role="alert" className="mb-2 text-sm text-destructive">{send.error.message} Your draft is preserved; retry sends the same request.</p>}
      <ChatComposer value={draft} onChange={setDraft} onSubmit={() => { if (draft.trim()) send.mutate(draft); }} submitting={send.isPending} disabled={!enabled || !session.isSuccess || !chat.isSuccess || send.isPending || agent.status === "paused" || agent.status === "terminated"} placeholder={`Message ${agent.name}…`} submitKey="mod-enter" hint={project ? `Project: ${project.name}. This is your ongoing conversation with ${agent.name}.` : "Company-wide conversation · Ctrl / ⌘ + Enter to send"} />
      {agent.status === "paused" && <p className="text-sm text-muted-foreground">This agent is paused. <Link to={agentUrl(agent)}>Review agent settings</Link>.</p>}
    </div>
  </section>;
}

function ProjectSummary({ companyId, project }: { companyId: string; project: Project }) {
  const client = useQueryClient();
  const selector = { companyId, scopeKind: "project" as const, scopeId: project.id, slotKey: "header" as const };
  const key = ["command-summary", companyId, project.id];
  const summary = useWorkspaceFeed(companyId, key, () => summarySlotsApi.get(selector));
  const refresh = useMutation({ mutationFn: () => summarySlotsApi.generate(selector), onSuccess: () => client.invalidateQueries({ queryKey: key }) });
  return <section className="command-card"><div className="flex items-center justify-between gap-2"><h3>In plain English</h3><Button variant="ghost" size="sm" onClick={() => refresh.mutate()} disabled={summary.isPending || refresh.isPending || summary.data?.slot?.status === "generating"}>Refresh</Button></div>
    {summary.isError || refresh.isError ? <p role="alert" className="text-sm text-destructive">{(summary.error ?? refresh.error)?.message}</p> : summary.data?.slot?.status === "failed" ? <p role="alert" className="text-sm text-destructive">Could not summarize. {summary.data.slot.failureReason}</p> : null}
    {summary.data?.slot?.status === "generating" && <p role="status" className="text-sm text-muted-foreground">Summary requested. Waiting for the reporting agent.</p>}
    {summary.data?.document ? <MarkdownBody>{ownerFacingMessage(summary.data.document.body)}</MarkdownBody> : <p className="text-sm text-muted-foreground">{summary.isPending ? "Loading summary…" : "No summary yet. Refresh asks the built-in Summarizer for an update."}</p>}
    {summary.data?.slot?.lastGeneratedAt && <p className="text-xs text-muted-foreground">Updated {relativeTime(summary.data.slot.lastGeneratedAt)}</p>}
  </section>;
}

export function CommandCenter() {
  const { selectedCompanyId, selectedCompany } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { openNewIssue } = useDialogActions();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState("Overview");
  useEffect(() => { setBreadcrumbs([{ label: "Home" }]); }, [setBreadcrumbs]);
  const agents = useWorkspaceFeed(selectedCompanyId, queryKeys.agents.list(selectedCompanyId!), () => agentsApi.list(selectedCompanyId!));
  const projects = useWorkspaceFeed(selectedCompanyId, queryKeys.projects.list(selectedCompanyId!), () => projectsApi.list(selectedCompanyId!));
  const projectId = params.get("project");
  const project = projects.data?.find((item) => item.id === projectId) ?? null;
  const requestedAgent = params.get("agent");
  const agent = agents.data?.find((item) => item.id === (requestedAgent ?? project?.leadAgentId)) ?? (!requestedAgent ? agents.data?.find((item) => item.role === "ceo") : undefined);
  const tasksQuery = useWorkspaceFeed(selectedCompanyId, ["issues", selectedCompanyId, "command", projectId], () => issuesApi.list(selectedCompanyId!, { projectId: projectId ?? undefined, limit: 100, sortField: "updated", sortDir: "desc" }));
  const activity = useWorkspaceFeed(selectedCompanyId, ["activity", selectedCompanyId, "command"], () => activityApi.list(selectedCompanyId!, { limit: 30 }));
  const tasks = operationalTasks(tasksQuery.data ?? []);
  const participants = project ? projectParticipants(agents.data ?? [], tasks, project.leadAgentId) : agents.data ?? [];
  const active = tasks.filter((task) => task.status === "in_progress");
  const blocked = tasks.filter((task) => task.status === "blocked");
  const reviews = tasks.filter((task) => task.status === "in_review");
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const recent = activity.data?.filter((event) => !project || taskById.has(event.entityId)).slice(0, 8) ?? [];
  const changeSelection = (key: string, value: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); if (key === "project") next.delete("agent"); setParams(next); };
  if (!selectedCompanyId) return <p>Select a company to open your workspace.</p>;
  const dataError = agents.isError || projects.isError || tasksQuery.isError;
  return <div className="command-center">
    <header className="command-topbar"><div><p className="command-eyebrow">Your workspace</p><select aria-label="Current project" value={projectId ?? ""} onChange={(event) => changeSelection("project", event.target.value)} className="command-select"><option value="">{selectedCompany?.name ?? "Company"} · All projects</option>{projects.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><Link to="/inbox" className="command-attention">Needs you <span>{tasksQuery.isSuccess ? blocked.length + reviews.length : "—"}</span><small>in loaded tasks</small></Link><Link to="/search" aria-label="Search company"><ArrowUpRight /></Link></header>
    {tasksQuery.isPending && <p role="status" className="p-4 text-muted-foreground">Loading task status…</p>}{dataError && <p role="alert" className="p-4 text-destructive">Some workspace data could not be loaded. Counts may be incomplete. <Button variant="outline" onClick={() => { void agents.refetch(); void projects.refetch(); void tasksQuery.refetch(); }}>Retry</Button></p>}
    {projectId && !project && projects.isSuccess ? <p role="alert" className="p-4">This project is unavailable. Choose another project above.</p> : <>
    <div className="command-toolbar"><label className="flex items-center gap-2 text-sm">Talking to <select aria-label="Talk to agent" className="command-select" value={agent?.id ?? ""} onChange={(event) => changeSelection("agent", event.target.value)}><option value="" disabled>Choose an agent</option>{agents.data?.filter((item) => item.status !== "terminated").map((item) => <option key={item.id} value={item.id}>{item.name} · {item.title || item.role}</option>)}</select></label><Button variant="outline" size="sm" onClick={() => openNewIssue({ projectId: project?.id, assigneeAgentId: agent?.id })}><Plus className="size-4" /> Assign a task</Button></div>
    <div className="command-grid"><div className="command-main">{agent ? <Conversation key={`${selectedCompanyId}:${agent.id}:${project?.id ?? "company"}`} companyId={selectedCompanyId} agent={agent} project={project} team={agents.data ?? []} /> : <div className="command-empty"><Bot /><h2>{agents.isPending ? "Loading your team…" : "Choose someone to talk to"}</h2><Link to="/agents/all">Open leads & agents →</Link></div>}
    <section className="command-recent"><div className="flex items-center justify-between"><h3>Recent activity</h3><Link to="/activity" className="text-sm text-muted-foreground">View activity →</Link></div>{activity.isError && <p role="alert">Activity is unavailable.</p>}{activity.isSuccess && recent.length === 0 && <p className="text-sm text-muted-foreground">No updates in the latest activity window.</p>}{recent.map((event) => <div className="command-activity-row" key={event.id}><CircleDot className="size-4" /><div><p>{agents.data?.find((item) => item.id === event.agentId)?.name ?? "Board / system"}</p><small>{activitySentence(event.action)}{taskById.has(event.entityId) && <> · <Link to={`/issues/${taskById.get(event.entityId)!.identifier ?? event.entityId}`}>{taskById.get(event.entityId)!.title}</Link></>}</small></div><time>{relativeTime(event.createdAt)}</time></div>)}</section></div>
    <aside className="command-context" aria-label="Project context"><header><p className="command-eyebrow">{project ? "Project" : "Company overview"}</p><h2>{project?.name ?? selectedCompany?.name}</h2><p className="text-sm text-muted-foreground">{project?.description ?? "Your people, work, and next decisions in one place."}</p></header><div role="tablist" aria-label="Project details" className="command-tabs">{["Overview", "Tasks", "Agents", "Files"].map((item) => <button key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === "Overview" && <><section className="command-card"><h3>Current focus</h3><p className="text-sm text-muted-foreground">{project ? `Stage: ${project.status.replaceAll("_", " ")}` : "Across the latest company tasks"}</p>{project && <p className="text-sm">Project lead: {agents.data?.find((item) => item.id === project.leadAgentId)?.name ?? "Not assigned"}</p>}{active.slice(0, 4).map((task) => <TaskLink key={task.id} task={task} />)}{tasksQuery.isSuccess && active.length === 0 && <p className="text-sm text-muted-foreground">No active tasks in this window.</p>}</section>{project && <ProjectSummary key={project.id} companyId={selectedCompanyId} project={project} />}<section className="command-card"><h3>Needs attention</h3>{[...blocked, ...reviews].slice(0, 5).map((task) => <TaskLink key={task.id} task={task} />)}{tasksQuery.isSuccess && blocked.length + reviews.length === 0 && <p className="text-sm text-muted-foreground">No blocked or review tasks in this window.</p>}</section>{project && <section className="command-card"><h3>Goals</h3>{project.goals?.map((goal) => <Link key={goal.id} to={`/goals/${goal.id}`} className="block text-sm">{goal.title} →</Link>)}{!project.goals?.length && <p className="text-sm text-muted-foreground">No goals linked yet.</p>}<Link to={`/projects/${project.urlKey ?? project.id}`} className="text-sm">Open project settings →</Link></section>}</>}
    {tab === "Tasks" && <section className="command-card"><h3>Project tasks</h3>{tasks.slice(0, 20).map((task) => <TaskLink key={task.id} task={task} />)}{tasksQuery.isSuccess && tasks.length === 0 && <p>No tasks yet.</p>}<Link to={project ? `/projects/${project.urlKey ?? project.id}` : "/issues"}>View all tasks →</Link></section>}
    {tab === "Agents" && <section className="command-card"><h3>{project ? "Lead & task owners" : "Your team"}</h3>{participants.map((item) => <button key={item.id} className="command-team-row" onClick={() => changeSelection("agent", item.id)}><AgentMark agent={item} /><span>{item.name}<small>{item.title || item.role} · {item.status}</small></span></button>)}{participants.length === 0 && <p className="text-sm text-muted-foreground">No project lead or task owners assigned.</p>}</section>}
    {tab === "Files" && <section className="command-card"><h3>Files & workspaces</h3>{project?.workspaces?.map((workspace) => <Link className="block text-sm" key={workspace.id} to={`/projects/${project.urlKey ?? project.id}/workspaces/${workspace.id}`}>{workspace.name} →</Link>)}<p className="text-sm text-muted-foreground">Open a task to view its documents and delivered files.</p><Link to="/artifacts">Browse company artifacts →</Link></section>}
    </aside></div><footer className="command-footer"><span>{project?.name ?? "All projects"}</span><span>{tasksQuery.isSuccess ? active.length : "—"} active tasks</span><span>{tasksQuery.isSuccess ? reviews.length : "—"} awaiting review</span><span>{tasksQuery.isSuccess ? blocked.length : "—"} blocked</span><small>Recent window · up to 100 tasks</small></footer></>}
  </div>;
}

function TaskLink({ task }: { task: Issue }) {
  return <Link className="command-task-link" to={`/issues/${task.identifier ?? task.id}`}><span>{task.title}</span><IssueStatusBadge status={task.status} /></Link>;
}
