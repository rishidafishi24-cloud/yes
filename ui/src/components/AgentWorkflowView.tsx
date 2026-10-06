import type { Agent } from "@paperclipai/shared";
import { useQuery } from "@tanstack/react-query";
import { agentsApi } from "@/api/agents";
import { queryKeys } from "@/lib/queryKeys";
import { AgentWorkspace } from "./AgentWorkspace";

/** The roster can hide built-ins; the workflow still needs its reporting agent. */
export function AgentWorkflowView({ companyId, agents }: { companyId: string; agents: Agent[] }) {
  const companyAgents = useQuery({ queryKey: queryKeys.agents.list(companyId), queryFn: () => agentsApi.list(companyId) });
  return <AgentWorkspace companyId={companyId} agents={companyAgents.data ?? agents} />;
}
