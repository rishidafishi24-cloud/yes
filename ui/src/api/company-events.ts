import { api } from "./client";

export interface CompanyEventV1 {
  version: 1;
  what: string;
  why: string | null;
  evidence: Array<{ kind: string; ref: string; label?: string }>; // max 20
  previousOwner: { kind: "agent" | "user" | "team" | "none"; ref: string | null; name: string | null } | null;
  previousStage: string | null;
  nextOwner: { kind: "agent" | "user" | "team" | "none"; ref: string | null; name: string | null } | null;
  nextStage: string | null;
  status: "started" | "in_progress" | "blocked" | "needs_review" | "done" | "failed" | "cancelled";
  humanAttentionRequired: boolean;
  humanAttentionReason: string | null;
}

export interface CompanyEventsResponse {
  events: CompanyEventV1[];
  nextCursor: string | null;
}

export const companyEventsApi = {
  list: (companyId: string, cursor?: string) => {
    const qs = cursor ? `?cursor=${cursor}` : "";
    return api.get<CompanyEventsResponse>(
      `/api/companies/${companyId}/events${qs}`,
    );
  },
};