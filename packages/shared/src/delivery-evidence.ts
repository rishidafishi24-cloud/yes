/**
 * Delivery evidence contract (T05).
 *
 * A work item may only claim a stage it can prove. The ladder is
 * DESIGNED -> CODED -> TESTED -> BUILT -> STAGED -> LIVE, and this module
 * answers one question: does this evidence justify advancing to that stage?
 *
 * Design rules, in priority order:
 *   1. Fail closed. Anything unexpected is `false`, never a throw. A gate that
 *      throws on malformed input is a gate that can be crashed past.
 *   2. Reviewed revision must equal the submitted revision. A review of some
 *      other commit does not approve this one.
 *   3. LIVE requires owner approval. Autonomy is earned through demonstrated
 *      reliability, so the last step is never automatic.
 *
 * Pure and additive: nothing here is wired into the server or UI yet.
 */
import { z } from "zod";

export const DELIVERY_EVIDENCE_CONTRACT = "delivery-evidence/v1";

/** Stage ladder. The order here is the order of trust. */
export const DELIVERY_STAGES = [
  "DESIGNED",
  "CODED",
  "TESTED",
  "BUILT",
  "STAGED",
  "LIVE",
] as const;

export type DeliveryStage = (typeof DELIVERY_STAGES)[number];

const GIT_SHA_RE = /^[0-9a-f]{40}$/;

const nonEmpty = (label: string) => z.string().min(1, `${label} must not be empty`);

const gitSha = (label: string) =>
  z.string().regex(GIT_SHA_RE, `${label} must be exactly 40 lowercase hex characters`);

export const deliveryCheckSchema = z.object({
  command: nonEmpty("check command"),
  status: z.enum(["pass", "fail", "skipped"]),
  log: z.string().optional(),
});

export const deliveryReviewSchema = z.object({
  reviewerId: nonEmpty("reviewerId"),
  revisionReviewed: gitSha("revisionReviewed"),
  verdict: z.enum(["accept", "reject"]),
  requiredFixes: z.array(nonEmpty("requiredFixes entry")).optional(),
  /** First attempt is 1. Zero is not a legitimate attempt number. */
  attempt: z.int().min(1),
});

export const deliveryEvidenceSchema = z.object({
  contract: z.literal(DELIVERY_EVIDENCE_CONTRACT),
  issueId: nonEmpty("issueId"),
  submission: z.object({
    kind: z.literal("git_commit"),
    sha: gitSha("submission.sha"),
    baseSha: gitSha("submission.baseSha"),
  }),
  checks: z.array(deliveryCheckSchema).min(1, "at least one check is required"),
  review: deliveryReviewSchema.optional(),
  approvedBy: z.string().optional(),
  /** Must be present, even when empty. A missing key means "not assessed". */
  unknowns: z.array(nonEmpty("unknowns entry")),
});

export type DeliveryCheck = z.infer<typeof deliveryCheckSchema>;
export type DeliveryReview = z.infer<typeof deliveryReviewSchema>;
export type DeliveryEvidence = z.infer<typeof deliveryEvidenceSchema>;

type EvidenceInput = unknown;

/**
 * Advance to a stage that depends on an earlier one only when that earlier
 * stage is itself satisfied. Keeps each rule stated once.
 */
const REQUIRES: Partial<Record<DeliveryStage, DeliveryStage>> = {
  TESTED: "CODED",
  BUILT: "TESTED",
  STAGED: "BUILT",
  LIVE: "STAGED",
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Never throws. Any parse or shape surprise is treated as "not proven". */
export function canAdvance(evidence: EvidenceInput, targetStage: DeliveryStage): boolean {
  if (!(DELIVERY_STAGES as readonly string[]).includes(targetStage)) return false;
  if (targetStage === "DESIGNED") return false;

  const parsed = deliveryEvidenceSchema.safeParse(evidence);
  if (!parsed.success) return false;
  const e = parsed.data;

  // A prerequisite stage must itself hold. Verified evidence cannot, for
  // example, be reviewed but untested.
  const prerequisite = REQUIRES[targetStage];
  if (prerequisite && !canAdvance(e, prerequisite)) return false;

  switch (targetStage) {
    case "CODED":
      return isNonEmptyString(e.submission.sha);

    case "TESTED":
      return e.checks.some((c) => c.status === "pass");

    case "BUILT":
      // Everything that ran must have passed; anything not run is `skipped`,
      // which does not count toward "built".
      return e.checks.every((c) => c.status === "pass") && Array.isArray(e.unknowns);

    case "STAGED":
      // A review only counts if it reviewed *this* revision.
      return e.review?.verdict === "accept" && e.review.revisionReviewed === e.submission.sha;

    case "LIVE":
      return isNonEmptyString(e.approvedBy);

    default:
      return false;
  }
}

/** True only when this evidence describes exactly that commit. */
export function isEvidenceFor(evidence: EvidenceInput, sha: string): boolean {
  if (!isNonEmptyString(sha)) return false;
  const parsed = deliveryEvidenceSchema.safeParse(evidence);
  if (!parsed.success) return false;
  return parsed.data.submission.sha === sha;
}
