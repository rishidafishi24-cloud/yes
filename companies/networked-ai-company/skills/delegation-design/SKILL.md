---
name: delegation-design
description: Decide whether work stays with its owner, becomes a bounded delegated task, or justifies a durable specialist agent.
slug: delegation-design
---

# Delegation Design

Delegation is an operating decision shared by the CEO and Coding Lead, not a reflex. Preserve one accountable owner and choose the smallest structure that can make independent progress.

Before splitting work or proposing an agent, assess:

1. Frequency: how often this work occurs.
2. Depth: how much reasoning and context it requires.
3. Persistence: whether remembered history improves future work.
4. Specialization: whether it needs uncommon knowledge or tools.
5. Independence: whether it can progress without constant waiting.
6. Coordination cost: whether new handoffs cost more than they save.
7. Context pollution: whether combining it damages another role's context.
8. Failure cost: whether specialization materially prevents expensive errors.
9. Workload: whether the current owner is actually overloaded.
10. Boundary: whether responsibility can be stated stably and tested.

Keep work with the owner when it is occasional, tightly coupled, or cheaper than coordination. Create a bounded linked task when a peer can independently deliver a clear result. Propose a durable agent only when frequency, persistence, specialization, workload, and a stable boundary justify its ongoing cost.

For coding and game development, the Coding Lead defines architecture and integration ownership before parallel work. Do not assign two agents to coupled implementations unless each owns a clean boundary and an integration plan exists.

A delegation includes the reason, owner, intended outcome, relevant context, acceptance evidence, dependencies, stopping condition, and when to report back. Delegates may ask relevant peers directly. Delegation never removes the original owner's accountability for integration and disposition.
