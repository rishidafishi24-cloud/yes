import { z } from "zod";

export const companyEventV1Schema = z.object({
  version: z.literal(1),
  what: z.string().min(1).max(600),
  why: z.string().max(600).nullable(),
  evidence: z.array(
      z.object({
        kind: z.string(),
        ref: z.string().max(500),
        label: z.string().max(200).optional(),
      }),
    ),
  previousOwner: z
    .object({
      kind: z.literal("agent") | z.literal("user") | z.literal("team") | z.literal("none"),
      ref: z.string().nullable(),
      name: z.string().nullable(),
    })
    .nullable(),
  previousStage: z.string().nullable(),
  nextOwner: z
    .object({
      kind: z.literal("agent") | z.literal("user") | z.literal("team") | z.literal("none"),
      ref: z.string().nullable(),
      name: z.string().nullable(),
    })
    .nullable(),
  nextStage: z.string().nullable(),
  status: z.enum(["started", "in_progress", "blocked", "needs_review", "done", "failed", "cancelled"]),
  humanAttentionRequired: z.boolean(),
  humanAttentionReason: z.string().max(400).nullable(),
});

export type CompanyEventV1 = z.infer<typeof companyEventV1Schema>;

export function renderCompanyEventNarrative(
  event: CompanyEventV1,
  subject?: string,
): string {
  let actor: string;
  if (event.previousOwner?.name) {
    actor = event.previousOwner.name;
  } else if (event.nextOwner?.name) {
    actor = event.nextOwner.name;
  } else {
    actor = "Someone";
  }

  const whyClause = event.why ? ` because ${event.why}` : "";

  const task = subject || "task";

  let nextPart = "";
  if (event.nextOwner?.name) {
    nextPart = `→ next: ${event.nextOwner.name}`;
    if (event.nextStage) {
      nextPart += `@${event.nextStage}`;
    }
  }

  let attentionPart = "";
  if (event.humanAttentionRequired && event.humanAttentionReason) {
    attentionPart = `Owner needs to: ${event.humanAttentionReason}`;
  }

  let evidencePart = "";
  if (event.evidence && event.evidence.length > 0) {
    const first = event.evidence[0];
    if (first.label) {
      evidencePart = ` ${first.label}`;
    }
  }

  const parts: string[] = [
    `${actor} ${event.what}${whyClause} on ${task}`,
  ];

  if (evidencePart) {
    parts.push(evidencePart);
  }

  if (nextPart) {
    parts.push(nextPart);
  }

  if (attentionPart) {
    parts.push(attentionPart);
  }

  return parts.join(" ");
}