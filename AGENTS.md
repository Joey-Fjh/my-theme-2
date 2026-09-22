# Agent Entry Guide

This file is the always-on entry point for agents working in this repository. Keep it lean: project identity, hard rules, one batch SOP, task routing, skills, validation, and gotchas.

`AGENTS.md` is the canonical repository rule source. Supporting docs under `docs/references/` provide details and examples. If a supporting doc conflicts with this file, follow this file.

---

## Project Context

This is an internal Shopify Skeleton Theme mother template for building future themes. Its storefront inventory starts from Shopify's official `skeleton-theme`; this repository adds only explicitly accepted project-owned infrastructure and capabilities, such as the lifecycle/runtime and Agent configuration. Derived themes own business features, page design, and Theme Store positioning.

Tech stack:

- Shopify Liquid sections, snippets, JSON templates, and locale files
- Tailwind CSS v4 with CSS-based config and `@theme inline`
- Alpine.js v3 for reactive UI state
- GSAP + ScrollTrigger (optional choreography tools for complex narrative motion, not the default for ordinary section reveal)
- Swiper as the selected carousel library, vendored when an accepted consumer exists (like GSAP)
- Custom runtime: import-map module graph, HTTP/section-refresh helpers, and the Alpine adapter (`define`, `defer`, `mount`, `unmount`, `store`, `data`). See `docs/references/architecture/javascript-runtime.md`.

Runtime constraints:

- No bundler is used.
- Scripts load via `defer` in `layout/theme.liquid`.
- Do not introduce React, Vue, TypeScript, or nested runtime asset structures unless the user explicitly approves an architecture change.

Third-party libraries are vendored files behind project adapters, not npm runtime packages. A selected library is vendored only when an accepted consumer exists. Every vendored library has an entry in `THIRD_PARTY_NOTICES.md`, updated in the same change that adds, replaces, or upgrades it.

---

## Agent Entry Points

- `AGENTS.md` is the source entry file. `CLAUDE.md` is a symlink adapter to `AGENTS.md`.
- `.agents/skills/` is the single source of truth for project skills. `.claude/skills/` is a symlink adapter to `../.agents/skills`.
- Cursor discovers `.agents/skills/` directly; do not add a duplicate `.cursor/skills/` tree or symlink.
- `.agents/roles/` contains vendor-neutral Implementer and Verifier role contracts.
- Tool-specific agent definitions such as `.codex/agents/*.toml`, `.cursor/agents/*.md`, and `.claude/agents/*.md` are thin adapters to the canonical `.agents/roles/` files.
- Tool-specific entry points may use relative symlinks to source files or directories. Do not copy rule or skill files into adapter paths.
- Tool-specific configuration belongs in tool-owned directories such as `.claude/`, `.codex/`, or `.cursor/`; it does not change the project skill source.
- `docs/` is the agent-readable knowledge layer. Read referenced docs only when task routing or the batch SOP calls for them.

Important paths: `.agents/skills/`, `.agents/roles/`, `docs/references/`, `docs/agent/`, theme implementation under `sections/`, `snippets/`, `assets/`, `tailwind/`, `locales/`, and merchant-owned `config/settings_data.json` and `templates/*.json`.

---

## Core Rules

Launch stability, accessibility, SEO, maintainability, merchant configurability, and mobile reliability outrank visual novelty and Lighthouse micro-optimizations. Theme Store submission completeness is a gate only when the user explicitly scopes a batch or derived theme to Theme Store submission. Theme Store accessibility and browser requirements may still be adopted as quality baselines; doing so does not import the Theme Store feature inventory into the mother template.

Treat these as launch blockers unless the user explicitly scopes them out:

- Theme Check errors
- Repository lint or test failures
- Accessibility regressions in user-facing controls, navigation, forms, dialogs, drawers, filters, search, cart, product media, or checkout-adjacent flows
- SEO regressions caused by theme code
- Broken mobile layouts or mobile-only interaction failures
- Manual edits to generated or vendor files
- Changes to merchant-owned configuration or content without explicit approval

Do not modify merchant-owned configuration or content unless explicitly authorized:

- `config/settings_data.json`
- `templates/*.json`
- color scheme values
- product, collection, page, article, blog, metafield, uploaded media, merchant copy, and navigation/content composition

Classify ambiguous issues before fixing them. If an issue could be code, configuration, content, uploaded asset, Shopify platform/vendor, or measurement noise, do not guess.

### Project Identity And Authority

- `my-skeleton-theme` is an internal Shopify Skeleton Theme mother template: minimal, official-Skeleton-aligned, modular, extensible, maintainable, and verifiable. Derived themes own business features, page design, and Theme Store positioning.
- Shopify's current official `skeleton-theme` defines the default storefront inventory boundary. Shopify best practices govern how retained code and approved additions are implemented; Theme Store submission feature requirements do not expand the mother-template inventory by themselves.
- Shopify Horizon is a reference for organization only, such as section and block structure; do not copy its code or import its features. Storefront features and review standards, including Theme Store requirements, come only from Shopify's official documentation queried through Shopify Dev MCP.
- Project additions require an explicit accepted decision. Current examples include the project-owned component lifecycle/runtime, native section motion, Agent/tooling configuration, and these generic storefront primitives (accepted 2026-09-21): cart page (the only built-in cart presentation), quantity selector, variant picker with shared dropdown, buy buttons, product media gallery, pagination with section refresh, localization switcher, accordion, header nested-menu dropdown, header search entry, and product card (neutral linked image/title/price in the collection grid, with one global image-ratio setting; derived themes own card appearance; accepted 2026-09-22). Action feedback stays local to the control or form that triggered it. Design-specific behavior (sticky or hide-on-scroll headers, sticky side panels, blog tabs, back-to-top, decorative icons) belongs to derived themes. Do not infer new storefront business features merely because a finished Theme Store theme would require them.
- In this repository, **Platform Required** means a Shopify platform constraint necessary for a valid theme or for an already retained capability. It does not mean every feature required for Theme Store submission.
- Keep one writer per shared worktree.
- Do not retain code merely because it already exists.
- The files under `docs/references/` describe what exists; they are evidence, not authority over what should be built. Architecture is decided from Shopify's current official sources and the user's stated intent; references are rewritten to match accepted decisions.

Hard implementation rules:

- Do not write inline `<script>` tags or bare global DOM listeners in Liquid.
- Pass Liquid-driven runtime values to JavaScript through `data-*`.
- Critical first-viewport content must render usable and visible without JavaScript or animation completion.
- User-visible strings, schema labels, ARIA copy, placeholders, and editor text must use locale keys.
- Use semantic interactive elements, keyboard access, visible focus, accessible names, and minimal ARIA.
- Do not manually edit vendor, generated, or optimized icon assets.

---

## Batch SOP

One numbered workflow replaces the former Session Start, Universal Work Loop, Agent behavior rules, and Record Layer Contract. The coordinator (the agent the user is talking to) owns steps 1–6 unless execution is delegated. Delegation does not transfer execution authority; one-writer and independent-review rules still apply.

| Step | Owner | Action | Stop condition |
| --- | --- | --- | --- |
| 1 | Coordinator | Read `docs/agent/board.md`, then `docs/agent/context.md` if continuing work. Read `docs/references/` only when task routing or the plan requires it. | Facts gathered; no implementation yet. |
| 2 | Coordinator + user | Discuss on `board.md`. One decision at a time. Update the board when discussion produces a conclusion, disagreement, or new pending decision. Record evidence, alternatives, disagreements, and pending decisions. If the user asks for review, orientation, or a prompt only, do not implement unless they explicitly authorize implementation. | A single direction is ready for the user to accept or reject. |
| 3 | Coordinator | When the user accepts a direction, remove resolved discussion from the board and write the plan into `context.md` with outcome, dependencies, **implementation surface**, and acceptance checks written as verifiable checks, not claims. | Plan recorded. **Recording is not authorization.** |
| 4 | User | Authorize the batch explicitly. Resolve every dependency listed in the plan first. | User grants execution authority for this batch only. |
| 5 | Implementer (coordinator or delegated `.agents/roles/implementer.md`) | Execute inside the surface. Give delegated work only the context the implementer needs (see template below). Inspect repository facts before asking the user; ask before editing when the unknown is merchant-owned configuration, product or design preference, architecture direction, or launch-risk tradeoff. For complex, risky, cross-session, or broad cleanup work, classify purpose, ownership, risk, and allowed action before editing. Select the smallest justified action. Do not repeat a failed action without new evidence. Do not stop after editing — validate and correct until checks pass or a genuine blocker needs user authority. Use Shopify Dev MCP for Shopify platform claims; use Context7 for third-party library docs when current-version sources matter, resolving the library ID at call time. Do not guess framework behavior when the appropriate MCP should be available. If an expected MCP is missing, first check client configuration, project trust, client restart, Node/npm, and network; only then fall back to the official website and state that degraded source explicitly. Deliver an external execution prompt only when the user requests it or work must run in another session or client. **Delivering a prompt is not completion.** | Implementation matches acceptance checks or a documented blocker remains. |
| 6 | Implementer | Record progress, validation output, blockers, and material corrections in `context.md`, not only in chat. | `context.md` reflects current execution state. |
| 7 | Verifier (someone other than the implementer; `.agents/roles/verifier.md`) | Review the diff and evidence against the plan's acceptance checks. | Review findings recorded; defects returned to step 5 or accepted with evidence. |
| 8 | User | Browser pass and explicit acceptance when the plan requires runtime verification. | User accepts or requests another correction cycle. |
| 9 | Coordinator | Commit when the user asks. Migrate durable contracts to `AGENTS.md`, a reference, code, or configuration. **Clear `context.md`.** | Plan removed from `context.md`; git holds history. |

**Record-layer checks (apply at steps 3, 6, and 9):**

- `docs/agent/context.md` holds **the plan currently under execution and its status, and nothing else**. `docs/agent/board.md` holds what has not yet become a plan.
- **One narrow exception:** more than one plan may coexist only when every extra entry is executed and waiting on verification the agent cannot perform (browser pass or human review). Each must name who verifies.
- An unexecuted plan, queued plan, or plan waiting on work the agent could finish does not belong in `context.md`.
- A batch's acceptance boundary names its **implementation surface**. Changing the record files is never a scope violation.
- Keep one decision active at a time on the board.
- Write acceptance checks as verifiable checks, not claims.
- Move stable contracts to `AGENTS.md` or the matching reference once settled; do not leave them only in chat or on the board.
- Chat history and commit messages are evidence, never a substitute for the current execution record.

### Implementer task template

Use when delegating or when the user requests a portable execution prompt:

1. Read `AGENTS.md`, then `docs/agent/context.md` for the active plan and acceptance boundary.
2. **Implementation surface:** list allowed paths. **Forbidden:** `config/settings_data.json`, `templates/*.json`, vendor/generated assets, and anything outside the surface unless the user widens it.
3. **Tasks:** numbered checks from the plan.
4. **Completion checks:** the plan's validators plus `npx prettier --check` on every changed file.
5. Record progress and validation in `docs/agent/context.md`.
6. Do not mark the plan accepted and do not commit unless the user asks.
7. **Report:** outcome, changed files, validation results, unverified items, risks.

### Reviewer checklist

Apply at SOP step 7 (also mirrored in `.agents/roles/verifier.md`):

- `git grep` (or equivalent) for consumers before accepting any deletion.
- Check CSS **layer** order, not only source order, when typography or field sizing is involved.
- Verify rendered output when a claim depends on platform behavior (for example iOS form zoom).
- Confirm the diff stays inside the recorded implementation surface.
- Re-run the plan's named validators; do not inherit the implementer's pass/fail claims.

---

## Task Routing

Read only the matching reference for the current task:

- JS runtime, lifecycle, events, HTTP, SectionRefresher, `{% block %}` / `{% partial %}` adoption, Alpine stores/components, Swiper/GSAP adoption: `docs/references/architecture/javascript-runtime.md`
- Motion policy, choreography, reduced motion, animation ownership, duplication: `docs/references/architecture/motion-architecture.md`
- Shared abstraction boundaries and whether to extend an existing utility/component: `docs/references/architecture/abstraction-boundaries.md`
- Theme Block inventory, Container host, blank-content and editor placeholder behavior, generic-block responsibility: `docs/references/architecture/theme-blocks.md`
- CSS layer ownership, typography tiers, color/surface rules, token/bridge contract, placement audits: `docs/references/style-system/css-architecture.md`
- Image snippet display behavior and `image.liquid` mode/fit contract: `docs/references/style-system/image-display-contract.md`
- i18n keys, locale structure, schema translation, hardcoded copy review: `docs/references/code-review/i18n-checklist.md`
- Shopify browser matrix, Tailwind build boundary, static compatibility checks, progressive enhancement, and WebKit guardrails: `docs/references/code-review/browser-compatibility.md`
- Launch readiness, Lighthouse ownership classification, cleanup safety, ignore-file boundaries, review output, and gate validation: `docs/references/code-review/launch-gate.md`

---

## Agent Skills

Project skills live in `.agents/skills/`. Two kinds:

- **Executable validators** (project-owned): `check-i18n` and `check-theme-architecture` wrap recurring validation commands.
- **Vendored documentation references** (GreenSock official, MIT): `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, and `gsap-performance`. Agent documentation only; no storefront payload.

Ordinary section reveal uses the native `data-motion-*` protocol (`docs/references/architecture/motion-architecture.md`). Read GSAP skills only after that reference classifies work as explicit complex choreography.

Do not create, install, or approve skills during ordinary theme work. Discuss skill changes only when the user explicitly asks.

---

## Validation

Run scripts through `npm.cmd` in this Windows PowerShell workspace. Default to the smallest command that proves the change. Reserve `npm.cmd run lint` and `npm.cmd test` for explicit user request, PR, version/release, or Theme Store submission gates.

| Change surface | Commands |
| --- | --- |
| Liquid, schema, architecture guardrails | `npm.cmd run lint:theme` and/or `npm.cmd run test:theme-check` |
| Locales, translated strings, schema copy | `npm.cmd run lint:i18n` |
| `tailwind/**` | `npm.cmd run scan:compat` |
| `assets/*.js`, embedded Liquid blocks | `npm.cmd run lint:compat` |
| Strict Liquid output parsing (filter-arg guard) | `npm.cmd run lint:liquid-syntax` |
| Agent rules, skills, roles, adapters | Link/syntax check on changed files + `npm.cmd run doctor:agent` |
| Release / PR / Theme Store gate | `npm.cmd run lint` and `npm.cmd run test` |

Build helpers: `npm.cmd run build:tw` (Tailwind iteration), `npm.cmd run build:svg` (staged icons in `icons/`). Do not run rewriting formatters unless the user asks.

---

## Gotchas

- `CLAUDE.md` and `.claude/skills` are symlinks. If they appear as plain files that is a local setup problem; do not replace them with copied rules or Skills. Run `npm.cmd run doctor:agent` and see README.
- The six files under `.claude/agents/`, `.cursor/agents/`, and `.codex/agents/` are per-client permission shims for Implementer and Verifier, not duplicates of `.agents/roles/`. Do not symlink them to the canonical roles or merge them across clients.
- `icons/` is intentionally Git-ignored and may not exist in a clean checkout. Create it only as temporary input for `npm.cmd run build:svg`; committed optimized icons live in `assets/`.
- Shopify theme assets are flat under `assets/`; do not create nested runtime asset directories.
- Do not code-fix Lighthouse findings until code ownership is clear.
- Browserslist config drives static compatibility checks, not Tailwind v4's build target. Do not add Vite, Autoprefixer, or broad polyfills without an explicit architecture decision.
- Do not mix visual redesign, architecture cleanup, Lighthouse fixes, and configuration changes in one batch.
- Preserve schema IDs, block types, section types, preset names, template references, and storefront behavior during cleanup.
- `.shopifyignore`, `.gitignore`, and `.prettierignore` have different scopes. Read `docs/references/code-review/launch-gate.md` before changing ignore rules.
- Codex loads project-level `.codex/config.toml` only for trusted projects. `trust_level` is machine-local and cannot be replaced by repository files.
