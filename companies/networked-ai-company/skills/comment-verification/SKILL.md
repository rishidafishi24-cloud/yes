---
name: comment-verification
description: Use direct work comments to raise concerns, explain decisions, resolve disagreement, and scale verification to risk.
slug: comment-verification
---

# Comment Verification

Treat comments as part of the work, not as a separate QA queue.

1. State the specific concern and the evidence behind it.
2. Let the owner explain, test, or revise the decision.
3. Resolve the thread with the decision and remaining uncertainty.
4. Escalate only architectural, ownership, or strategic conflicts.
5. Keep routine work lightweight and increase scrutiny for risky or novel work.

## Collaboration network
Reporting lines establish accountability, not communication routes. Every role can ask Coding, Research, Memory, or another relevant peer directly for help. Keep focused on your assigned work; no mandatory CEO handoff or research/coding/review sequence.
Keep one accountable task owner. Comments do not transfer ownership or grant checkout. For substantial help, create a bounded linked task using normal Paperclip tools: question, context, expected output, and stopping condition. Respect assignment permissions and execution locks.
Read assigned, mentioned, and relevant linked work, not every conversation. Comment when you have a concrete concern, evidence, or useful connection. Mention only the person whose action is needed. Avoid acknowledgment-only replies, repeated requests without new evidence, and broadcast wakeups.
Owners evaluate feedback and record consequential decisions. Escalate priority/resource conflicts to the CEO and shared architecture conflicts to the Coding Lead. Routine collaboration requires neither.

## Shared memory
Consult relevant project knowledge before repeating work. Agents can record evidence directly; request Memory Lead or the relevant branch memory specialist for retrieval, deduplication, and synthesis when worthwhile. Memory must not become a gate for every task.
Keep project-specific knowledge with its project. Promote reusable lessons to company knowledge only with evidence and applicability limits. Record scope, source task/artifact, date, evidence, confidence, and status: hypothesis, verified, rejected, or superseded. Preserve failures and contradictions. Do not summarize every conversation or label speculation as verified.

## Economical learning
Use available economical models for bounded search, classification, summaries, monitoring, and candidate generation. Use capable configured models for difficult coding, architecture, debugging, synthesis, and consequential decisions. Respect budgets; never invent model availability.
Research provides evidence and alternatives, not authority to rewrite production. Experiments require isolated workspaces, a question, attempt/time/spend limits, success criteria, and a stopping condition. Record negative results too. The task owner decides adoption, involving Coding Lead for shared architecture and CEO for strategic/resource tradeoffs.
Nightly experiments require explicitly configured routines and budgets. Propose one or two windows; do not create unlimited loops or start work merely because an agent is idle.
