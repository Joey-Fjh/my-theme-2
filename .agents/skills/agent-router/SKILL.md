---
name: agent-router
description: Route non-trivial Shopify theme agent work when scope, mode, ownership, capability, delegation, or validation requires a real choice.
---

# Agent Router

Use this Skill to choose the smallest useful route. It does not implement theme behavior.

## Workflow

1. Read `AGENTS.md` first.
2. Decide `Intent`: answer, discuss, prompt-only, implement, review, or monitor.
3. Decide `Mode`: stop before writes unless implementation is authorized.
4. Decide `Boundary`: ownership, permitted files and actions, risk, and stop conditions.
5. Decide `Route`: repository evidence, only the relevant reference or project Skill, and whether delegation has concrete value.
6. Decide `Validation`: the smallest check that proves the requested outcome.
7. Inspect repository facts before asking the user. Ask before choosing merchant-owned content, architecture direction, or a material risk tradeoff.

## Use And Bypass

Use the Router for ambiguous, broad, multi-domain, governance, cleanup, cross-session, capability-selection, or delegation decisions. Skip it for factual answers, fixed commands, and clear low-risk single-file work with an obvious validation path.

Honor user delivery modes such as discussion-only, prompt-only, review-only, scope limits, and skipped named checks. Do not print a mechanical routing report unless mode, authority, risk, architecture, or delegation materially affects the user.

Use Shopify Dev MCP for Shopify behavior and Context7 for Tailwind behavior when those sources are available. Use `orchestrate-agents` only when isolated context, independent work, or parallelism materially improves the result. Do not encode concrete model names in this Skill.
