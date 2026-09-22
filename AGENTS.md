# Agent Entry Guide

This file is the always-on entry point for agents working in this repository. Keep it lean: project identity, hard rules, routing, skills, validation commands, and gotchas only. Within that scope it stays complete for implementation-independent identity, safety, authority, merchant ownership, launch blockers, workflow, routing, validation, adapter guardrails, and accessibility safeguards.

`AGENTS.md` is the canonical repository rule source. Supporting docs under `docs/references/` provide details and examples. If a supporting doc conflicts with this file, follow this file.

---

## Session Start

At the start of each session, read `docs/agent/board.md` for active issues, pending decisions, and work batches. Update `board.md` when discussion produces a conclusion, disagreement, or new pending decision.

Read `docs/agent/context.md` when continuing previous work, executing from an agreed plan, or recording current progress and acceptance.

Read other files under `docs/references/` only when the task routing below calls for them.

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

The technology list describes current project choices. Their detailed contracts belong in the Task Routing references; approved constraints, including Runtime constraints below, remain binding until an explicit architecture decision changes them. An existing implementation alone does not establish a permanent project requirement.

Third-party libraries are vendored files behind project adapters, not npm runtime packages, so they stay swappable. Splits follow high cohesion and low coupling. A selected library is vendored only when an accepted consumer exists. Every vendored library has an entry in `THIRD_PARTY_NOTICES.md`, updated in the same change that adds, replaces, or upgrades it.

Runtime constraints:

- No bundler is used.
- Scripts load via `defer` in `layout/theme.liquid`.
- Do not introduce React, Vue, TypeScript, or nested runtime asset structures unless the user explicitly approves an architecture change.

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

### Universal Work Loop

- Inspect available repository and documentation facts before asking the user; ask only for missing intent, preference, architecture, risk, or authority decisions.
- Select the smallest justified action.
- When execution is authorized, do not stop after editing. Validate against the acceptance criteria and correct until they pass, the requested boundary is reached, or a genuine blocker requires new authority or a user decision.
- Do not declare completion from implementation alone and do not repeat a failed action without new evidence. Report the outcome first, then evidence, validation, unresolved risk, and next action.
- Give delegated work only the necessary context. A delegated agent may execute an authorized batch; its result is still reviewed against the recorded acceptance boundary by someone other than its author.
- The primary agent — the one the user is talking to — is the coordinator: it carries out the Universal Work Loop, the Agent behavior rules and the Record Layer Contract, prepares bounded batches per Execution authority, and routes review. It may delegate to Scout, Implementer, or Verifier (`.agents/roles/`); delegation does not transfer execution authority, and one-writer and independent-review rules still apply.

Agent behavior rules:

- Execution authority: the user owns the outcome, priorities, batch boundary, and execution authority. Inside an authorized batch, make the implementation choices and write the files directly; do not ask the user to approve individual implementation details. Use a self-contained external execution prompt only when the user asks for prompt delivery or when the work must run in another session or client. Delivering a prompt does not complete a batch; completion requires an implemented change and acceptance.
- If the user asks for review, orientation, or a prompt, do not refactor or implement unless they explicitly ask for implementation.
- Facts discoverable from the repository must be inspected before asking the user. Ask before editing when the unknown is merchant-owned configuration, product/design preference, architecture direction, or launch-risk tradeoff. For complex, risky, cross-session, or broad cleanup work, classify purpose, ownership, risk, and allowed action before editing.
- Use Shopify Dev MCP for Shopify API, Liquid, theme architecture, and platform requirements. Use Context7 for third-party library documentation when current-version sources matter, including but not limited to Tailwind, Alpine, GSAP, and Swiper; resolve the library ID at call time. Do not guess framework behavior when the appropriate MCP should be available. If an expected MCP is missing, first check client configuration, project trust, client restart, Node/npm, and network; only after configuration is confirmed may you fall back to the official website and state that degraded source explicitly.
- Persist active discussion, evidence, alternatives, disagreements, and pending decisions in `docs/agent/board.md`. Record an agreed plan, its boundary, and its dependencies in `docs/agent/context.md` before implementation, and keep current progress, validation, and acceptance there; `docs/agent/context.md` is the execution source. A recorded plan is not authorization: execute it only after the user explicitly authorizes that batch and every listed dependency is resolved. Move stable contracts to `AGENTS.md` or the matching docs reference once they are settled. Do not leave either only in chat.

### Record Layer Contract

`docs/agent/context.md` holds **the plan currently under execution and its status, and nothing else**. `docs/agent/board.md` holds what has not yet become a plan.

This is checkable, not a matter of judgment. Read `context.md`'s headings: a second plan, any narrative of finished work, any decision with no scheduled batch, or any pending-migration list is a violation. Fix it in the same turn you notice it.

**One narrow exception.** More than one plan entry may coexist only when every extra entry is already executed and waiting on a verification step the agent cannot perform — a browser pass, or a review by someone else. Each such entry must name the verification it waits on and who performs it. This does not cover an unexecuted plan, a queued plan, or a plan waiting on anything the agent could finish itself: that is unfinished work, not a pending acceptance, and it does not belong here.

Lifecycle for one plan:

1. Board carries the evidence, alternatives, and open decisions. A board proposal is not executable.
2. When the user accepts a direction, remove the resolved discussion from the board and write the plan into `context.md` with its scope, dependencies, acceptance boundary, and status.
3. Recording is not authorization. Execute only after the user authorizes that batch and every recorded dependency is resolved.
4. A batch may run in this client, through an external prompt, or via a delegated agent. Delivering a prompt is not completion.
5. During execution keep progress, validation, blockers, and material corrections in `context.md`, not only in chat.
6. Review the result against the recorded acceptance boundary, by someone other than its author. Mark it accepted only from review evidence plus user acceptance.
7. **On acceptance, clear it.** Delete the plan entry, migrate any durable contract it produced to `AGENTS.md`, a reference, code, configuration, `README.md`, or a role file, and delete the execution narrative — git already holds it. `context.md` returns to holding one plan or none.

A batch's acceptance boundary names its **implementation surface**: the rule, reference, theme, and configuration files it may change. The two record files are the record layer, maintained alongside every batch; changing them is never a scope violation.

Keep one decision active at a time. A discussion that accumulates several decisions yields research that is sound but unusable, because no single conclusion can be extracted and accepted.

Write an execution spec as checks, not as claims. A criterion asserting what a file contains can be wrong and then silently authorize a deletion; a criterion naming tokens that must resolve cannot.

Chat history and commit messages are evidence, never a substitute for the current execution record.

### Project Identity And Authority

- `my-skeleton-theme` is an internal Shopify Skeleton Theme mother template: minimal, official-Skeleton-aligned, modular, extensible, maintainable, and verifiable. Derived themes own business features, page design, and Theme Store positioning.
- Shopify's current official `skeleton-theme` defines the default storefront inventory boundary. Shopify best practices govern how retained code and approved additions are implemented; Theme Store submission feature requirements do not expand the mother-template inventory by themselves.
- Project additions require an explicit accepted decision. Current examples include the project-owned component lifecycle/runtime, native section motion, Agent/tooling configuration, and these generic storefront primitives (accepted 2026-09-21): cart page (the only built-in cart presentation), quantity selector, variant picker with shared dropdown, buy buttons, product media gallery, pagination with section refresh, localization switcher, accordion, header nested-menu dropdown, and header search entry. Action feedback stays local to the control or form that triggered it. Design-specific behavior (sticky or hide-on-scroll headers, sticky side panels, blog tabs, back-to-top, decorative icons) belongs to derived themes. Do not infer new storefront business features merely because a finished Theme Store theme would require them.
- In this repository, **Platform Required** means a Shopify platform constraint necessary for a valid theme or for an already retained capability. It does not mean every feature required for Theme Store submission.
- While working on this Skeleton repository, do not modify `my-theme-1`; it is read-only historical evidence. After the Skeleton is established, changing `my-theme-1` is a separate downstream task. This mother template requires no compatibility with Ceylune appearance, content, schemas, configuration, or behavior.
- Keep one writer per shared worktree.
- Do not retain code merely because it already exists.
- Classification vocabulary: Platform Required, Skeleton Core, Optional Capability, Theme-Specific Implementation, Tooling and Governance, Open Decision. Classify against the official Skeleton inventory plus explicitly accepted project additions; keep platform validity, Theme Store submission scope, and mother-template architecture separate.
- When the user asks to continue previous work, review outstanding tasks, or prepare next-session context, read `docs/agent/context.md`.
- The files under `docs/references/` describe what exists; they are evidence, not authority over what should be built. Architecture is decided from Shopify's current official sources and the user's stated intent; references are rewritten to match accepted decisions.

Hard implementation rules:

- Do not write inline `<script>` tags or bare global DOM listeners in Liquid.
- Pass Liquid-driven runtime values to JavaScript through `data-*`.
- Critical first-viewport content must render usable and visible without JavaScript or animation completion.
- User-visible strings, schema labels, ARIA copy, placeholders, and editor text must use locale keys.
- Use semantic interactive elements, keyboard access, visible focus, accessible names, and minimal ARIA.
- Do not manually edit vendor, generated, or optimized icon assets.

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
- **Vendored documentation references** (GreenSock official, MIT): `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, and `gsap-performance`. These are agent documentation only; they do not wrap validators, do not vend the GSAP runtime, and add no storefront payload.

**Motion boundary:** Ordinary section reveal uses the native `data-motion-*` protocol and Intersection Observer (`docs/references/architecture/motion-architecture.md`). Read the GSAP documentation skills only after that reference classifies work as explicit complex choreography.

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
- Do not mix visual redesign, architecture cleanup, Lighthouse fixes, and configuration changes in one batch.
- Preserve schema IDs, block types, section types, preset names, template references, and storefront behavior during cleanup.
- `.shopifyignore`, `.gitignore`, and `.prettierignore` have different scopes. Read `docs/references/code-review/launch-gate.md` before changing ignore rules.
- Codex loads project-level `.codex/config.toml` only for trusted projects. `trust_level` is a machine-local setting and cannot be replaced by repository files. After configuring a new machine, restart the client and confirm the MCP servers appear in the tool list.
