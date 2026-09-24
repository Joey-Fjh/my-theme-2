# Work Board

This board holds only what is not yet decided: the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Project identity, scope, and overall status belong in `docs/project.md`; accepted contracts belong in `AGENTS.md`, a routed reference, code, or configuration; completed execution history belongs in Git.

Last updated: 2026-09-24.

## Open decisions

- **Enforce settled implementation contracts (B) — waiting on the user's reading of `docs/references/`.** Rules that must never be bypassed (for example, fonts only through `--font-body-*` / `--font-heading-*`, a failure seen in an earlier project) are prose only today: `.agents/skills/check-theme-architecture/SKILL.md:31` still excludes typography-token and CSS-layer conventions as "undecided", which is stale since the typography scale was settled. Direction from the sources below: turn must-hold rules into lint checks (deterministic), and rewrite the remaining prose rules as a paired "don't X, use Y" with a 3–10 line example. The user will mark which rules must be enforced and which are stale or wrong; the checks are then discussed one by one (detection method, false positives).
  - Found 2026-09-22: `SKILL.md` "What `lint:theme` Covers" lists 2 rules, but `lint-theme.js` enforces 4: protected runtime names, tab ARIA, one `{% stylesheet %}` / `{% javascript %}` per file with no Liquid inside (`css-architecture.md`), and the `rgba(var(--color-*), alpha)` form (`css-architecture.md`). The fifth rule, on `[data-motion-reveal]`, was removed with the reveal on 2026-09-23. Its "not enforced yet" paragraph (line 31) is stale. Order agreed with the user: review references first, then update `SKILL.md` and the scripts together in one batch, so rules and checks change once. A check stays while the code and the accepted scope still use what it guards, not because a reference mentions it.

## Deferred ideas

- GSAP documentation Skills stay pinned as recorded in each skill's `UPSTREAM.md`; their descriptions do not override the project motion policy in `docs/references/architecture/motion-architecture.md`. Runtime libraries are vendored only for accepted consumers.
- Tailwind's fixed source vocabulary and the generated stylesheet name are revisited only for a concrete workflow need. Theme Block scope, image/video behavior, and the page/Section/Block layout protocol are future feature work.
- Verify Shopify Dev MCP and Context7 availability when a task needs them.
