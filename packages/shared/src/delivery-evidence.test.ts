import { describe, expect, it } from "vitest";
import {
  canAdvance,
  deliveryEvidenceSchema,
  isEvidenceFor,
  type DeliveryEvidence,
} from "./delivery-evidence.js";

const SHA = "a".repeat(40);
const BASE_SHA = "b".repeat(40);
const OTHER_SHA = "c".repeat(40);

/** Minimal evidence that parses: coded, one passing check, no unknowns. */
function minimal(overrides: Partial<DeliveryEvidence> = {}): DeliveryEvidence {
  return {
    contract: "delivery-evidence/v1",
    issueId: "MYMA-1",
    submission: { kind: "git_commit", sha: SHA, baseSha: BASE_SHA },
    checks: [{ command: "pnpm vitest run", status: "pass" }],
    unknowns: [],
    ...overrides,
  };
}

describe("deliveryEvidenceSchema", () => {
  it("1. parses a valid minimal evidence object", () => {
    const result = deliveryEvidenceSchema.safeParse(minimal());
    expect(result.success).toBe(true);
  });

  it("2. rejects missing submission.sha", () => {
    const bad = { ...minimal() } as Record<string, unknown>;
    delete bad.submission;
    expect(deliveryEvidenceSchema.safeParse(bad).success).toBe(false);
  });

  it("3. rejects a sha that is not 40 lowercase hex characters", () => {
    const cases = [
      "a".repeat(39), // too short
      "a".repeat(41), // too long
      "A".repeat(40), // uppercase
      "z".repeat(40), // non-hex
      "", // empty
    ];
    for (const sha of cases) {
      const result = deliveryEvidenceSchema.safeParse(
        minimal({ submission: { kind: "git_commit", sha, baseSha: BASE_SHA } }),
      );
      expect(result.success, `expected ${JSON.stringify(sha)} to be rejected`).toBe(false);
    }
  });

  it("6. rejects a missing `unknowns` key", () => {
    // A missing key means "not assessed", which is not the same as "none".
    const bad = { ...minimal() } as Record<string, unknown>;
    delete bad.unknowns;
    expect(deliveryEvidenceSchema.safeParse(bad).success).toBe(false);
  });

  it("7. rejects review.attempt of 0", () => {
    const result = deliveryEvidenceSchema.safeParse(
      minimal({
        review: { reviewerId: "r1", revisionReviewed: SHA, verdict: "accept", attempt: 0 },
      }),
    );
    expect(result.success).toBe(false);
  });

  it("8. rejects a contract other than delivery-evidence/v1", () => {
    for (const contract of ["delivery-evidence/v2", "", "v1", undefined]) {
      const result = deliveryEvidenceSchema.safeParse({ ...minimal(), contract });
      expect(result.success, `expected ${JSON.stringify(contract)} to be rejected`).toBe(false);
    }
  });

  it("rejects a checks array with no items", () => {
    const result = deliveryEvidenceSchema.safeParse(minimal({ checks: [] }));
    expect(result.success).toBe(false);
  });
});

describe("canAdvance", () => {
  it("4. is false for STAGED when the reviewed revision is not the submitted one", () => {
    const evidence = minimal({
      review: {
        reviewerId: "r1",
        revisionReviewed: OTHER_SHA, // reviewed a different commit
        verdict: "accept",
        attempt: 1,
      },
    });
    expect(canAdvance(evidence, "STAGED")).toBe(false);
  });

  it("4b. is true for STAGED when the reviewed revision matches the submission", () => {
    const evidence = minimal({
      review: { reviewerId: "r1", revisionReviewed: SHA, verdict: "accept", attempt: 1 },
    });
    expect(canAdvance(evidence, "STAGED")).toBe(true);
  });

  it("5. is false for BUILT when any check failed", () => {
    const evidence = minimal({
      checks: [
        { command: "a", status: "pass" },
        { command: "b", status: "fail" },
      ],
    });
    expect(canAdvance(evidence, "BUILT")).toBe(false);
  });

  it("5b. is false for BUILT when a check was skipped", () => {
    const evidence = minimal({
      checks: [
        { command: "a", status: "pass" },
        { command: "b", status: "skipped" },
      ],
    });
    expect(canAdvance(evidence, "BUILT")).toBe(false);
  });

  it("9. is false for LIVE when approvedBy is absent", () => {
    const evidence = minimal({
      review: { reviewerId: "r1", revisionReviewed: SHA, verdict: "accept", attempt: 1 },
    });
    expect(canAdvance(evidence, "LIVE")).toBe(false);
  });

  it("9b. is false for LIVE when approvedBy is blank", () => {
    const evidence = minimal({
      review: { reviewerId: "r1", revisionReviewed: SHA, verdict: "accept", attempt: 1 },
      approvedBy: "   ",
    });
    expect(canAdvance(evidence, "LIVE")).toBe(false);
  });

  it("10. is true for LIVE given all-pass, accepted, matching revision, and approval", () => {
    const evidence = minimal({
      checks: [
        { command: "unit", status: "pass" },
        { command: "typecheck", status: "pass" },
      ],
      review: { reviewerId: "r1", revisionReviewed: SHA, verdict: "accept", attempt: 1 },
      approvedBy: "owner",
      unknowns: ["flaky integration test on slow runners"],
    });
    expect(canAdvance(evidence, "LIVE")).toBe(true);
  });

  it("10b. is false for LIVE when the review verdict is reject", () => {
    const evidence = minimal({
      review: { reviewerId: "r1", revisionReviewed: SHA, verdict: "reject", attempt: 1 },
      approvedBy: "owner",
    });
    expect(canAdvance(evidence, "LIVE")).toBe(false);
  });

  it("11. returns false for non-object input instead of throwing", () => {
    const badInputs = [null, undefined, 42, "evidence", true, [], () => {}, Symbol("x")];
    for (const input of badInputs) {
      for (const stage of ["CODED", "TESTED", "BUILT", "STAGED", "LIVE"] as const) {
        expect(() => canAdvance(input, stage)).not.toThrow();
        expect(canAdvance(input, stage), `${String(input)} @ ${stage}`).toBe(false);
      }
    }
  });

  it("is false for DESIGNED, which is the entry point rather than an advance", () => {
    expect(canAdvance(minimal(), "DESIGNED")).toBe(false);
  });

  it("is false for an unrecognised stage", () => {
    expect(canAdvance(minimal(), "SHIPPED" as never)).toBe(false);
  });
});

describe("isEvidenceFor", () => {
  it("is true only for the exact submitted sha", () => {
    const evidence = minimal();
    expect(isEvidenceFor(evidence, SHA)).toBe(true);
    expect(isEvidenceFor(evidence, OTHER_SHA)).toBe(false);
    expect(isEvidenceFor(evidence, "")).toBe(false);
  });

  it("is false for malformed evidence rather than throwing", () => {
    expect(isEvidenceFor(null, SHA)).toBe(false);
    expect(isEvidenceFor({}, SHA)).toBe(false);
  });
});
