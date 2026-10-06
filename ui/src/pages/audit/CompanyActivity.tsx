import { useCallback, useEffect, useState } from "react";
import { History } from "lucide-react";
import { useSearchParams } from "@/lib/router";
import { useCompany } from "../../context/CompanyContext";
import { useBreadcrumbs } from "../../context/BreadcrumbContext";
import { useStreamlinedUiEnabled } from "../../hooks/useStreamlinedUiEnabled";
import { EmptyState } from "../../components/EmptyState";
import { AuditFeed, type AuditFeedMode } from "./AuditFeed";
import { AuditHub } from "./AuditHub";
import { NarrativeFeed } from "./NarrativeFeed";
import { useToastActions } from "@/context/ToastContext";
import { useQuery } from "@tanstack/react-query";
import { CompanyEventV1, renderCompanyEventNarrative } from "@paperclipai/shared";
import { summarySlotsApi } from "@/api/summarySlots";
import { companyEventsApi } from "@/api/company-events";
import { cn } from "@/lib/utils";

/**
 * Canonical `/:company/activity` entrypoint for the Audit hub. It retains the
 * shared all-actors and privileged Agent Actions modes while Runs, Costs,
 * Budgets, and Timeline live as peer sections. The mode lives in `?mode=` so `/audit` deep
 * links can preset it and links stay shareable. The server enforces both tiers.
 */
export function CompanyActivity() {
  const { enabled: streamlinedUiEnabled } = useStreamlinedUiEnabled();
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode: AuditFeedMode = searchParams.get("mode") === "agents" ? "agents" : "all";
  const actionParam = searchParams.get("action");
  const actionDomain = [
    "issue.",
    "agent.",
    "heartbeat.",
    "approval.",
    "project.",
    "goal.",
    "tool_",
    "cost.",
    "company.",
  ].includes(actionParam ?? "") ? actionParam! : "__all";

  useEffect(() => {
    if (!streamlinedUiEnabled) setBreadcrumbs([{ label: "Activity" }]);
  }, [setBreadcrumbs, streamlinedUiEnabled]);

  const handleModeChange = useCallback(
    (next: AuditFeedMode) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current);
          if (next === "agents") params.set("mode", "agents");
          else params.delete("mode");
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const handleActionDomainChange = useCallback(
    (next: string) => {
      setSearchParams((current) => {
        const params = new URLSearchParams(current);
        if (next === "__all") params.delete("action");
        else params.set("action", next);
        return params;
      }, { replace: true });
    },
    [setSearchParams],
  );

  const [narrativeMode, setNarrativeMode] = useState("all");

  // Digest — latest company summary slot
  const {
    data: summary,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["summary-slot", selectedCompanyId, "header"],
    queryFn: () => selectedCompanyId ? summarySlotsApi.get({ companyId: selectedCompanyId, scopeKind: "project", slotKey: "header" }) : undefined,
    enabled: !!selectedCompanyId,
    refetchOnWindowFocus: false,
  });

  // Needs Your Attention: open events with humanAttentionRequired, deduped by subject
  const [attentionItems, setAttentionItems] = useState<
    Array<{
      id: string;
      what: string;
      reason: string;
      href: string | null;
    }>
  >([]);

  useEffect(() => {
    if (!selectedCompanyId) return;
    void companyEventsApi.list(selectedCompanyId).then((response) => {
      const events = response.events;
      const attentionMap = new Map<string, {
        id: string;
        what: string;
        reason: string;
        href: string | null;
      }>();

      for (const event of events) {
        if (!event.humanAttentionRequired) continue;

        // Dedupe by what string + previousOwner name combination
        // Since CompanyEventV1 has no `id`, use what + owner as the key
        const key = `${event.what}|${event.previousOwner?.name ?? "none"}`;
        const existing = attentionMap.get(key);
        if (existing) continue;

        // Build deep link based on evidence
        let href: string | null = null;
        if (event.evidence && event.evidence.length > 0) {
          const first = event.evidence[0];
          if (first.kind === "issue" && first.ref) {
            href = `/issues/${first.ref}`;
          } else if (first.kind === "approval" && first.ref) {
            href = `/approvals/${first.ref}`;
          }
        }

        const narrative = renderCompanyEventNarrative(event, event.what);
        attentionMap.set(key, {
          id: key,
          what: narrative,
          reason: event.humanAttentionReason ?? "Requires owner attention",
          href,
        });
      }

      setAttentionItems(Array.from(attentionMap.values()));
    });
  }, [selectedCompanyId]);

  const handleRefresh = useCallback(() => {
    setAttentionItems([]);
  }, []);

  if (streamlinedUiEnabled) return <AuditHub section="activity" />;

  if (!selectedCompanyId) {
    return <EmptyState icon={History} message="Select an organization to view activity." />;
  }

  return (
    <div className="space-y-4">
      {/* Digest display at the top */}
      <div className="border-b border-border pb-2">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading digest…</div>
        ) : error ? (
          <div className="text-sm text-destructive">Failed to load digest.</div>
        ) : summary?.document?.title ? (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-md bg-primary/10 p-2">
                <div className="text-primary text-sm font-medium">
                  {summary.document.title?.slice(0, 2) ?? "DS"}
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {summary.document.title ?? "Company Summary"}
              </p>
              <p className="text-xs text-muted-foreground">
                Generated {summary.slot?.lastGeneratedAt ? new Date(summary.slot.lastGeneratedAt).toLocaleString() : "unknown time"}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="ml-2 text-xs text-primary hover:underline"
            >
              Refresh
            </button>
          </div>
        ) : null}
      </div>

      {/* Tabs: Activity / Narrative */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setNarrativeMode("all")}
          className={cn(
            "flex-1 py-2 text-sm font-medium text-foreground border-b-2 border-transparent",
            narrativeMode === "all" && "border-b-2 border-border"
          )}
        >
          Activity (technical)
        </button>
        <button
          onClick={() => setNarrativeMode("narrative")}
          className={cn(
            "flex-1 py-2 text-sm font-medium text-foreground border-b-2 border-transparent",
            narrativeMode === "narrative" && "border-b-2 border-primary"
          )}
        >
          Narrative
        </button>
      </div>

      {/* Needs Your Attention section */}
      {attentionItems.length > 0 && (
        <div className="mt-3 space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Needs Your Attention</h4>
          <div className="space-y-1">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="px-2 py-1 rounded border border-border text-xs"
              >
                <p className="font-medium text-foreground truncate">{item.what}</p>
                {item.reason && (
                  <p className="text-muted-foreground text-xs line-clamp-1">{item.reason}</p>
                )}
                {item.href && (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-xs hover:underline mt-0.5 block"
                  >
                    View details
                  </a>
                )}
              </div>
            ))}
          </div>
          {attentionItems.length === 0 && (
            <p className="text-xs text-muted-foreground">No events require your attention right now.</p>
          )}
        </div>
      )}

      {/* Main content area */}
      {narrativeMode === "all" ? (
        <AuditFeed
          companyId={selectedCompanyId}
          mode={mode}
          onModeChange={handleModeChange}
          actionDomain={actionDomain}
          onActionDomainChange={handleActionDomainChange}
        />
      ) : (
        <NarrativeFeed companyId={selectedCompanyId} />
      )}
    </div>
  );
}