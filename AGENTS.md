# Agent Entry Guide

This file is the always-on entry point for agents working in this repository. Keep it lean: project identity, hard rules, routing, skills, validation commands, and gotchas only.

`AGENTS.md` is the canonical repository rule source. Supporting docs under `docs/references/` provide details and examples. If a supporting doc conflicts with this file, follow this file.

---

## Session Start

At the start of each session, read `docs/agent/board.md` for active issues, pending decisions, and work batches. Update `board.md` when discussion produces a conclusion, disagreement, or new pending decision.

Read `docs/agent/context.md` when continuing previous work, executing from an agreed plan, or recording current progress and acceptance.

Read other files under `docs/references/` only when the task routing below calls for them.

---

## Project Context

This is an internal Shopify Skeleton Theme mother template for building future themes. It keeps a minimal, platform-complete architecture and quality baseline; derived themes own their business features, page design, and Theme Store positioning.

Tech stack:

- Shopify Liquid sections, snippets, JSON templates, and locale files
- Tailwind CSS v4 with CSS-based config and `@theme inline`
- Alpine.js v3 for reactive UI state
- GSAP + ScrollTrigger (optional choreography tools for complex narrative motion, not the default for ordinary section reveal)
- Swiper for carousels
- Custom runtime: `Components.register()`, `ThemeEvents`, `ShopifyHttp`, `ShopifySectionRefresher`
  See `docs/references/architecture/javascript-runtime.md` for API details and usage patterns.

Runtime constraints:

- No bundler is used.
- Scripts load via `defer` in `layout/theme.liquid`.
- Do not introduce React, Vue, TypeScript, ESM imports, or nested runtime asset structures unless the user explicitly approves an architecture change.

---

## Agent Entry Points

- `AGENTS.md` is the source entry file. `CLAUDE.md` is a symlink adapter to `AGENTS.md`.
- `.agents/skills/` is the single source of truth for project skills. `.claude/skills/` is a symlink adapter to `../.agents/skills`.
- Cursor discovers `.agents/skills/` directly; do not add a duplicate `.cursor/skills/` tree or symlink.
- `.agents/roles/` contains the vendor-neutral Scout, Implementer, and Verifier role contracts.
- Tool-specific agent definitions such as `.codex/agents/*.toml`, `.cursor/agents/*.md`, and `.claude/agents/*.md` are thin adapters to the canonical `.agents/` role files.
- Tool-specific entry points may use relative symlinks to source files or directories. Do not copy rule or skill files into adapter paths.
- Tool-specific configuration, including MCP, permissions, local settings, and hooks, belongs in tool-owned directories such as `.claude/`, `.codex/`, or `.cursor/`; it does not change the project skill source.
- `docs/` is the agent-readable knowledge layer. Read referenced docs only when the task needs them.

Important paths:

- `.agents/skills/`: project skills
- `.agents/roles/`: portable multi-agent role contracts
- `docs/references/`: on-demand architecture explanations and decision boundaries
- `docs/agent/`: short current-state and cross-session handoff
- `sections/`, `snippets/`, `assets/`, `tailwind/`, `locales/`: theme implementation
- `config/settings_data.json` and `templates/*.json`: merchant-owned configuration

---

## Core Rules

Launch stability, Shopify Theme Store readiness, accessibility, SEO, maintainability, merchant configurability, and mobile reliability outrank visual novelty and Lighthouse micro-optimizations.

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

### Universal Work Loop

- Inspect available repository and documentation facts before asking the user; ask only for missing intent, preference, architecture, risk, or authority decisions.
- When execution is authorized, do not stop after editing. Validate against the acceptance criteria and correct until they pass, the requested boundary is reached, or a genuine blocker requires new authority or a user decision.
- Do not declare completion from implementation alone and do not repeat a failed action without new evidence. Report the outcome first, then evidence, validation, unresolved risk, and next action.

Agent behavior rules:

- Execution authority: the user owns the outcome, priorities, batch boundary, and execution authority. Inside an authorized batch, make the implementation choices and write the files directly; do not ask the user to approve individual implementation details. Use a self-contained external execution prompt only when the user asks for prompt delivery or when the work must run in another session or client. Delivering a prompt does not complete a batch; completion requires an implemented change and acceptance.
- If the user asks for review, orientation, or a prompt, do not refactor or implement unless they explicitly ask for implementation.
- Facts discoverable from the repository must be inspected before asking the user. Ask before editing when the unknown is merchant-owned configuration, product/design preference, architecture direction, or launch-risk tradeoff. For complex, risky, cross-session, or broad cleanup work, classify purpose, ownership, risk, and allowed action before editing.
- Use Shopify Dev MCP for Shopify API, Liquid, theme architecture, and platform requirements. Use Context7 for third-party library documentation when current-version sources matter, including but not limited to Tailwind, Alpine, GSAP, and Swiper; resolve the library ID at call time. Do not guess framework behavior when the appropriate MCP should be available. If an expected MCP is missing, first check client configuration, project trust, client restart, Node/npm, and network; only after configuration is confirmed may you fall back to the official website and state that degraded source explicitly.
- Persist active discussion, evidence, alternatives, disagreements, and pending decisions in `docs/agent/board.md`. Record an agreed plan, its boundary, and its dependencies in `docs/agent/context.md` before implementation, and keep current progress, validation, and acceptance there; `docs/agent/context.md` is the execution source. A recorded plan is not authorization: execute it only after the user explicitly authorizes that batch and every listed dependency is resolved. Move stable contracts to `AGENTS.md` or the matching docs reference once they are settled. Do not leave either only in chat.
- When the user asks to continue previous work, review outstanding tasks, or prepare next-session context, read `docs/agent/context.md`.

Hard implementation rules:

- Do not write inline `<script>` tags or bare global DOM listeners in Liquid.
- JS behavior needing lifecycle management must use `Components.register()` inside `{%- javascript -%}`.
- Reusable Alpine behavior must be registered via `AlpineComponentsFactory.register()` in the appropriate `alpine.components.*.js` file.
- Pass Liquid-driven runtime values through `data-*`; do not embed complex Liquid, JSON, or quote-heavy values directly in `x-data`.
- Cross-section/component communication must use `ThemeEvents`.
- Application HTTP must use `window.ShopifyHttp`; raw `fetch()` belongs only in `assets/https.js` or vendor files.
- Shopify section HTML replacement must use `window.ShopifySectionRefresher.render()`.
- Storefront cart mutations and cart UI state must go through `$store.cart`.
- Above-the-fold critical content must render usable and visible without JavaScript or animation completion. Do not hide critical first-viewport content behind GSAP, Alpine, Swiper initialization, delayed transitions, `opacity-0`, `hidden`, `x-show="false"`, off-screen transforms, or callbacks.
- `motion_enabled` / `body[data-motion-enabled='false']` is the merchant-facing page and brand motion gate for reveal, media reveal, scroll, and narrative motion. Do not use it as a blanket kill switch for hover, focus, dropdown, dialog, drawer, loading, or other state/micro interactions; those interactions must instead respect `prefers-reduced-motion`.
- Tailwind utility classes first; no ad-hoc `<style>` blocks in Liquid templates.
- Do not use Tailwind text-size utilities for headings; use project typography tiers from `tailwind/tailwind.typography.css`.
- Choose semantic `h1`–`h6` level for document outline and visual `heading-h*` tier independently for design size; `heading-h*` classes belong only on semantic heading elements; use display tiers or `typo-subtitle` plus size tiers where the design requires non-default sizing.
- Use `body-*` tiers only for non-heading body semantics; default body copy inherits global body settings instead of section-level text-size settings.
- Inspect existing snippets, components, and utilities before adding another; reuse only when semantics, invariants, lifecycle, and ownership match.
- Do not create renamed duplicate wrappers or add mode/branch parameters to force divergent behavior into shared abstractions.
- User-visible strings, schema labels, ARIA copy, placeholders, and editor text must use locale keys.
- Use semantic interactive elements, keyboard access, visible focus, accessible names, and minimal ARIA.

Generated/vendor file rules:

- Never edit `vendor-*.min.js` or `vendor-*.min.css`.
- Never manually edit `assets/tailwind.output.css`.
- Treat `icons/` as an ignored temporary import directory, not retained source. To add or replace an icon, stage its SVG there, run `npm.cmd run build:svg`, review the optimized `assets/icon-*.svg` result, and then clear the staging input; do not hand-edit optimized icon assets.
- Never paste raw SVG into Liquid; render through the `icons` snippet.

---

## Task Routing

Read only the matching reference for the current task:

- JS runtime, lifecycle, events, HTTP, SectionRefresher, Alpine stores/components, Swiper, GSAP setup: `docs/references/architecture/javascript-runtime.md`
- Motion policy, choreography, reduced motion, animation ownership, duplication: `docs/references/architecture/motion-architecture.md`
- Shared abstraction boundaries and whether to extend an existing utility/component: `docs/references/architecture/abstraction-boundaries.md`
- CSS layer ownership, typography tiers, color/surface rules, token/bridge contract, placement audits: `docs/references/style-system/css-architecture.md`
- Image snippet display behavior and `image.liquid` mode/fit contract: `docs/references/style-system/image-display-contract.md`
- i18n keys, locale structure, schema translation, hardcoded copy review: `docs/references/code-review/i18n-checklist.md`
- Shopify browser matrix, Tailwind build boundary, static compatibility checks, progressive enhancement, and WebKit guardrails: `docs/references/code-review/browser-compatibility.md`
- Launch readiness, Lighthouse ownership classification, cleanup safety, ignore-file boundaries, review output, and gate validation: `docs/references/code-review/launch-gate.md`

---

## Agent Skills

Project skills live in `.agents/skills/`. This project has two skills — `check-i18n` and `check-theme-architecture` — both wrapping executable validators.

Do not create, install, or approve skills during ordinary theme work. Discuss skill changes only when the user explicitly asks.

---

## Validation Commands

Default to the smallest command that proves the change. Reserve full `npm.cmd run lint` and `npm.cmd test` for explicit user request or PR, version/release, and Theme Store submission gates. In this Windows PowerShell workspace, run scripts through `npm.cmd`.

```bash
npm.cmd run lint          # i18n, theme architecture, compatibility, and format checks
npm.cmd run lint:liquid-syntax # strict Liquid output parsing guard
npm.cmd run lint:theme    # protected runtime-name assign/capture, tab a11y, SVG WebKit guardrails
npm.cmd run lint:i18n     # locale keys, translated strings, schema copy, ARIA copy
npm.cmd run lint:compat   # CSS, JS, and embedded Liquid browser compatibility checks
npm.cmd run scan:compat   # rebuild Tailwind output, then run compatibility checks
npm.cmd test              # strict Liquid syntax guard, then Shopify Theme Check
npm.cmd run test:theme-check # Shopify Theme Check only
npm.cmd run build:tw      # rebuild Tailwind output after Tailwind source changes
npm.cmd run build:svg     # optimize staged icons into theme assets
npm.cmd run dev           # Shopify theme dev + Tailwind watch
```

During development, choose the narrowest command for the changed surface. Examples:

- Liquid, schema, or generic architecture guardrail changes: `npm.cmd run lint:theme` or `npm.cmd run test:theme-check`
- Locale or i18n changes: `npm.cmd run lint:i18n`
- Tailwind source changes: `npm.cmd run scan:compat` (rebuilds `assets/tailwind.output.css` first)
- Agent rules, Skills, roles, or adapters: validate syntax and links for the changed files, then inspect the resulting diff.

Run `npm.cmd run lint` and `npm.cmd test` only when the user explicitly asks, or before opening a PR, cutting a version/release, or submitting to the Theme Store. Use `npm.cmd run build:tw` only for intermediate Tailwind iteration. Run `npm.cmd run build:svg` only when an SVG is staged in `icons/` for import or replacement. Do not run rewriting formatters unless the user asks.

---

## Gotchas

- `CLAUDE.md` and `.claude/skills` are symlinks. If they appear as plain files that is a local setup problem; do not replace them with copied rules or Skills. Run `npm.cmd run doctor:agent` and see README.
- The nine files under `.claude/agents/`, `.cursor/agents/`, and `.codex/agents/` are per-client permission shims, not duplicates. Do not symlink them to `.agents/roles/` and do not merge them across clients: each client reads a different permission field (`permissionMode`, `readonly`, `sandbox_mode`) and none reads the canonical `filesystem-profile`.
- `icons/` is intentionally Git-ignored and may not exist in a clean checkout. Create it only as temporary input for `npm.cmd run build:svg`; committed optimized icons live in `assets/`.
- Shopify theme assets are flat under `assets/`; do not create nested runtime asset directories.
- Do not code-fix Lighthouse findings until code ownership is clear.
- Browserslist config drives static compatibility checks, not Tailwind v4's build target. Do not add Vite, Autoprefixer, or broad polyfills without an explicit architecture decision.
- Do not extend shared abstractions by adding mode flags or branching parameters for divergent behavior. Read `docs/references/architecture/abstraction-boundaries.md`.
- Do not mix visual redesign, architecture cleanup, Lighthouse fixes, and configuration changes in one batch.
- Preserve schema IDs, block types, section types, preset names, template references, and storefront behavior during cleanup.
- `.shopifyignore`, `.gitignore`, and `.prettierignore` have different scopes. Read `docs/references/code-review/launch-gate.md` before changing ignore rules.
- Codex loads project-level `.codex/config.toml` only for trusted projects. `trust_level` is a machine-local setting and cannot be replaced by repository files. After configuring a new machine, restart the client and confirm the MCP servers appear in the tool list.
