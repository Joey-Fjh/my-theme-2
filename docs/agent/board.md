# Work Board

This board holds the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Accepted contracts belong in `AGENTS.md`, a routed reference, code, or configuration; completed execution history belongs in Git.

Last updated: 2026-09-22.

## Status

The mother-template goal was met on 2026-09-22. All five steps were accepted after independent review: Toast and cart drawer removal, product-card anchor, typography and mobile text, JS/CSS architecture closure, and the Agent layer SOP and validator audit. `npm.cmd run lint` and `npm.cmd test` pass. The durable workflow is the Batch SOP in `AGENTS.md`; git holds the execution history.

No open decisions. The `AGENTS.md` trim (204 → 166 lines) and the subagent-approval rule were reviewed and committed on 2026-09-22. The readiness review below is closed. Waiting on the user: observe the first GitHub run of the CI stale-CSS check after a push, and start the `v1.0.0` tag when their questions are closed (the agent does not raise it).

## Skeleton readiness review (2026-09-22) — closed

Claude scored 78/100 and GPT 84/100; the largest deduction was the undocumented derived-theme workflow. Outcomes:

- **R1 — derived-theme start (done).** `README.md` "Start a derived theme": `shopify theme init --clone-url` or `git clone`, edit directly, push to the derived theme's own repository, connect the Shopify GitHub integration. No downstream update path.
- **R2 — versioning (settled).** One `v1.0.0` tag or GitHub Release as a record, started by the user. No CHANGELOG.
- **R3 — browser smoke checklist (dropped).** The user runs browser checks; each plan names the pages and actions to check. Static compatibility stays with `lint:compat` and `scan:compat`.
- **R4 — CI stale-CSS check (done).** The lint job rebuilds Tailwind and fails on a diff in `assets/tailwind.output.css`. Its first GitHub run is not yet observed.
- **R5 — article structured data (dropped).** Official Skeleton emits only `product | structured_data`, like this repository; a derived theme adds article JSON-LD if it wants it.
- **R6 — reference sources (done).** `AGENTS.md` Project Identity: Horizon is an organization-only reference; features and review standards come only from Shopify official docs through Shopify Dev MCP.
- **R7 — performance tooling (deferred to a derived theme with a store).** Lighthouse CI, the benchmark store, Theme Inspector, and the Web Performance Dashboard need a store; see https://shopify.dev/docs/storefronts/themes/best-practices/performance/testing-for-performance. Theme Check `AssetSizeCSS` / `AssetSizeJavaScript` stay off, as in `theme-check:recommended`.
- **R8 — Theme Store standard (done).** No local copy; `AGENTS.md` Task Routing links the official requirements, review stages, and testing checklist. The skeleton stays submission-compatible, not submission-complete. Known gap: a derived theme targeting submission must build the gift-card recipient form. The user's optional listing features belong to each derived theme.
- **No Playwright** (decided 2026-09-22): a real storefront run needs store access; the user's own browser checks cover the need.
- Minifying `tailwind.output.css` is not worth it (about 1 KB gzipped).

## Deferred ideas

- GSAP documentation Skills stay pinned as recorded in each skill's `UPSTREAM.md`; their descriptions do not override the native ordinary-motion policy. Runtime libraries are vendored only for accepted consumers.
- Tailwind's fixed source vocabulary and the generated stylesheet name are revisited only for a concrete workflow need. Theme Block scope, image/video behavior, and the page/Section/Block layout protocol are future feature work.
- Verify Shopify Dev MCP and Context7 availability when a task needs them.

## Closed decisions relevant to scope

- Color scheme classes are merchant-driven and retained; the CSS reference owns their token contract.
- Ordinary section reveal uses the native motion protocol; the motion reference owns the contract.
- Existing evidence/source rules are kept; no separate dated-evidence Skills rule.
- The accepted storefront primitives are listed in `AGENTS.md`; design-specific behavior belongs to derived themes.
- No separate feature definition-of-done or design-to-code standard (user, 2026-09-22): the user leads derived-theme work through the board → context → review SOP, and each plan's acceptance checks carry the standard.
