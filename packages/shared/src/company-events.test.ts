import { describe, expect, it } from "vitest";
import { companyEventV1Schema, CompanyEventV1, renderCompanyEventNarrative } from "./company-events.js";

const validEvent: CompanyEventV1 = {
  version: 1,
  what: "started working on a feature",
  why: "to unblock the pipeline",
  evidence: [
    { kind: "issue", ref: "issue-123", label: "Bug report" },
    { kind: "comment", ref: "comment-456" },
  ],
  previousOwner: { kind: "user", ref: "user-789", name: "Alice" },
  previousStage: "backlog",
  nextOwner: { kind: "agent", ref: "agent-abc", name: "Claude" },
  nextStage: "in_progress",
  status: "in_progress",
  humanAttentionRequired: false,
  humanAttentionReason: null,
};

const eventWithWhy: CompanyEventV1 = {
  version: 1,
  what: "started working on a feature",
  why: "to unblock the pipeline",
  evidence: [],
  previousOwner: { kind: "user", ref: "user-789", name: "Alice" },
  previousStage: "backlog",
  nextOwner: { kind: "agent", ref: "agent-abc", name: "Claude" },
  nextStage: "in_progress",
  status: "in_progress",
  humanAttentionRequired: false,
  humanAttentionReason: null,
};

const eventNoWhy: CompanyEventV1 = {
  version: 1,
  what: "started working on a feature",
  why: null,
  evidence: [],
  previousOwner: { kind: "user", ref: "user-789", name: "Alice" },
  previousStage: "backlog",
  nextOwner: { kind: "agent", ref: "agent-abc", name: "Claude" },
  nextStage: "in_progress",
  status: "in_progress",
  humanAttentionRequired: false,
  humanAttentionReason: null,
};

const eventWithFullAttention: CompanyEventV1 = {
  version: 1,
  what: "started working on a feature",
  why: "to unblock the pipeline",
  evidence: [{ kind: "issue", ref: "issue-123", label: "Bug report" }],
  previousOwner: { kind: "user", ref: "user-789", name: "Alice" },
  previousStage: "backlog",
  nextOwner: { kind: "agent", ref: "agent-abc", name: "Claude" },
  nextStage: "in_progress",
  status: "in_progress",
  humanAttentionRequired: true,
  humanAttentionReason: "pending review needed",
};

const eventWithEvidenceLabel: CompanyEventV1 = {
  version: 1,
  what: "started working on a feature",
  why: null,
  evidence: [{ kind: "issue", ref: "issue-123", label: "Bug report" }],
  previousOwner: { kind: "user", ref: "user-789", name: "Alice" },
  previousStage: "backlog",
  nextOwner: { kind: "agent", ref: "agent-abc", name: "Claude" },
  nextStage: "in_progress",
  status: "in_progress",
  humanAttentionRequired: false,
  humanAttentionReason: null,
};

const eventWithPreviousOwnerOnly: CompanyEventV1 = {
  version: 1,
  what: "started working on a feature",
  why: null,
  evidence: [],
  previousOwner: { kind: "user", ref: "user-789", name: "Alice" },
  previousStage: "backlog",
  nextOwner: { kind: "agent", ref: "agent-abc", name: "Claude" },
  nextStage: null,
  status: "in_progress",
  humanAttentionRequired: false,
  humanAttentionReason: null,
};

const eventWithNoOwnerNames: CompanyEventV1 = {
  version: 1,
  what: "started working on a feature",
  why: null,
  evidence: [],
  previousOwner: { kind: "user", ref: "user-789", name: null },
  previousStage: null,
  nextOwner: { kind: "agent", ref: "agent-abc", name: null },
  nextStage: null,
  status: "in_progress",
  humanAttentionRequired: false,
  humanAttentionReason: null,
};

describe("company-events schema", () => {
  it("validates a complete valid event", () => {
    expect(companyEventV1Schema.parse(validEvent)).toBeDefined();
  });

  it("rejects version not equal to 1", () => {
    expect(companyEventV1Schema.safeParse({ ...validEvent, version: 2 }).success).toBe(false);
  });

  it("rejects what outside 1..600 chars", () => {
    expect(companyEventV1Schema.safeParse({ ...validEvent, what: "" }).success).toBe(false);
    expect(companyEventV1Schema.safeParse({ ...validEvent, what: "a".repeat(601) }).success).toBe(false);
  });

  it("rejects why outside <=600 chars when provided", () => {
    expect(companyEventV1Schema.safeParse({ ...validEvent, why: "a".repeat(601) }).success).toBe(false);
  });

  it("rejects more than 20 evidence items", () => {
    const tooMany = { ...validEvent, evidence: Array(21).fill({ kind: "issue", ref: "1" }) };
    expect(companyEventV1Schema.safeParse(tooMany).success).toBe(false);
  });

  it("rejects evidence with invalid kind string (validated at runtime)", () => {
    expect(companyEventV1Schema.safeParse({ ...validEvent, evidence: [{ kind: "invalid", ref: "1" }] }).success).toBe(false);
  });

  it("rejects evidence ref outside 500 chars", () => {
    expect(companyEventV1Schema.safeParse({ ...validEvent, evidence: [{ kind: "issue", ref: "a".repeat(501) }] }).success).toBe(false);
  });

  it("rejects evidence label outside 200 chars", () => {
    expect(companyEventV1Schema.safeParse({ ...validEvent, evidence: [{ kind: "issue", ref: "1", label: "a".repeat(201) }] }).success).toBe(false);
  });

  it("rejects invalid status", () => {
    expect(companyEventV1Schema.safeParse({ ...validEvent, status: "invalid" }).success).toBe(false);
  });

  it("rejects missing humanAttentionRequired", () => {
    expect(companyEventV1Schema.safeParse({ ...validEvent, humanAttentionRequired: undefined }).success).toBe(false);
  });

  it("rejects humanAttentionReason outside 400 chars", () => {
    expect(companyEventV1Schema.safeParse({ ...validEvent, humanAttentionReason: "a".repeat(401) }).success).toBe(false);
  });
});

describe("company-events renderer", () => {
  it("renders full narrative with why, evidence, next, and attention", () => {
    const result = renderCompanyEventNarrative(eventWithFullAttention, "issue #123");
    expect(result).toContain("Alice started working on a feature because to unblock the pipeline on issue #123");
    expect(result).toContain("→ next: Claude@in_progress");
    expect(result).toContain("Owner needs to: pending review needed");
    expect(result).toContain("Bug report");
  });

  it("omits why clause when why is null", () => {
    const result = renderCompanyEventNarrative(eventNoWhy, "issue #123");
    expect(result).not.toContain("because");
    expect(result).toContain("Alice started working on a feature on issue #123");
  });

  it("renders attention when humanAttentionRequired is true", () => {
    const result = renderCompanyEventNarrative(eventWithFullAttention, "issue #123");
    expect(result).toContain("Owner needs to: pending review needed");
  });

  it("omits attention when humanAttentionRequired is false", () => {
    const result = renderCompanyEventNarrative(validEvent, "issue #123");
    expect(result).not.toContain("Owner needs to:");
  });

  it("renders first evidence label inline", () => {
    const result = renderCompanyEventNarrative(eventWithEvidenceLabel, "issue #123");
    expect(result).toContain("Bug report");
  });

  it("does not render bare id when label is present", () => {
    const result = renderCompanyEventNarrative(eventWithEvidenceLabel, "issue #123");
    expect(result).not.toContain("issue-123");
  });

  it("renders next owner and stage when present", () => {
    const result = renderCompanyEventNarrative(validEvent, "issue #123");
    expect(result).toContain("→ next: Claude@in_progress");
  });

  it("renders next owner without stage when stage is null", () => {
    const result = renderCompanyEventNarrative(eventWithPreviousOwnerOnly, "issue #123");
    expect(result).toContain("→ next: Claude");
    expect(result).not.toContain("@");
  });

  it("falls back to 'Someone' when no owner names available", () => {
    const result = renderCompanyEventNarrative(eventWithNoOwnerNames, "issue #123");
    expect(result).toContain("Someone started working on a feature on issue #123");
  });

  it("uses subject when provided", () => {
    const result = renderCompanyEventNarrative(validEvent, "issue #456");
    expect(result).toContain("on issue #456");
  });

  it("defaults to 'task' when no subject provided", () => {
    const result = renderCompanyEventNarrative(validEvent);
    expect(result).toContain("on task");
  });
});