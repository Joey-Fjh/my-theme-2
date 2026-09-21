# Work Board

This board is the discussion surface for active and deferred decisions: evidence, alternatives, disagreements, and questions that have not yet reached an accepted direction.

- `context.md` holds exactly one selected current plan, including its dependencies, authorization, execution, validation, and acceptance status, or no plan. Unselected and unscheduled work remains here.
- Selecting and recording a plan does not authorize execution. Execution requires explicit user authorization for that batch and resolved dependencies.
- On acceptance, clear the completed plan from `context.md`, migrate durable contracts to `AGENTS.md`, code, configuration, or the matching reference, and remove obsolete discussion from this board.
- Delivering an execution prompt does not complete a batch. Completion requires implementation, validation, independent review, and user acceptance.
- **One decision is active at a time.** Evidence that several decisions share lives under Shared Evidence, not inside whichever decision happened to surface it. A discussion that accumulates unrelated decisions is split before it grows further.
- This file and `context.md` are construction-phase records. Migrate lasting rules and remove both when the Skeleton is complete.

Last updated: 2026-09-21.

Decision IDs are labels, not an index. The sequence has gaps: D4 through D14 were never recorded in any committed document and survive only in early chat history, and D18 was assigned and retired within a single session. A missing number means no record exists, not that a record was lost.

---

## How these decisions are made

Stated by the user on 2026-09-17 and applied from here on.

The files under `docs/references/` describe the current Ceylune-derived implementation. They are **evidence of what exists, never authority over what should be built**. Quoting a reference as a constraint argues from the artifact this project is replacing, and is not a valid objection to a proposed architecture.

The Skeleton's architecture is decided from two sources only: **Shopify's current official sources**, and **the user's stated intent**. Source roles are not interchangeable: the official `skeleton-theme` defines the default storefront inventory, best-practice documentation governs implementation quality, and Theme Store submission requirements apply only when the user explicitly puts that scope into the mother template or a derived theme. Once a decision is accepted, the references are rewritten to match it; they are an output of the decision, not an input to it.

One caveat does bind: the real constraint is the code, not the documentation. Deleting a rule does not delete the runtime JavaScript or the 27 classic script tags that implement it. Existing code is measured as migration debt against the accepted target, and is never a reason to lower the target.

Authoritative sources for this series: `github.com/Shopify/skeleton-theme` for inventory, `shopify.dev/docs/storefronts/themes/best-practices` for implementation quality, and `.../theme-features` / `.../store` only for an explicitly accepted feature or submission scope. A feature's Theme Store status alone never makes it Skeleton Core.

---

## Open Evidence

None open. Findings from reviews that are not yet decisions are listed under the cleanup candidates below.

---

## Pending decisions and migration work

Nothing below is a plan. Each item needs a decision before it can become one.

### Accepted architecture awaiting permanent ownership

- The official Skeleton inventory and explicitly accepted project additions stay available through minimal, industry-neutral implementations and the smallest useful main-section compositions. Current project additions include the lifecycle/runtime and Agent/tooling configuration; finished-theme business features are not inferred.
- The accepted initial Theme Block inventory is `group`, `heading`, `text`, and `button`: group owns child composition; heading separates semantic level from visual tier; text owns non-heading rich text; button owns navigation-style calls to action. `image` remains deferred to the media contract; do not migrate `snippets/image.liquid` or turn preview-only Liquid features into undeclared stable requirements.
- Blank-content rule, accepted with TB1 on 2026-09-21: a Theme Block whose required content is blank renders nothing in the storefront, and only in the editor (`request.design_mode`) a non-semantic placeholder that carries `block.shopify_attributes`, so the block stays selectable. `blocks/heading.liquid` and `blocks/button.liquid` implement it. The host for the four blocks is `sections/custom-section.liquid`, shown in the editor as Container.
- A generic block may vary appearance while preserving semantics, but must not collect unrelated ownership, business semantics, or behavior modes merely to reuse markup.
- Liquid July '26 `{% block %}` and `{% partial %}` features are not stable requirements. Any `{% partial %}` trial must be low risk and verify ordinary rendering, Theme Editor behavior, accessibility state, request races, Alpine lifecycle, and custom component lifecycle.
- `ShopifySectionRefresher` remains transitional while retained flows depend on Section Rendering API behavior; removal requires approved replacements with explicit lifecycle, accessibility, error, and history ownership.
- Tailwind remains. The CSS decision and its constraints are now owned by `docs/references/style-system/css-architecture.md`. One lever stays unused: a fixed `@source inline(...)` vocabulary with `source(none)` would make ordinary section work buildless, since the emitted set would stop depending on markup. Measured at 4,934 brotli bytes, so it is a build-workflow question, not a payload one.
- Token boundary, generated stylesheet name, and Swiper ownership remain later decisions.

### Pluggable-core direction

Stated and confirmed by the user on 2026-09-17 as the Skeleton's target shape. The accepted JavaScript decisions now live in `AGENTS.md`, `docs/references/architecture/javascript-runtime.md`, and the implementation; only the remaining unresolved parts stay here.

- The always-loaded entry owns thinking method and SOP. Typography, JavaScript, and library choices are pluggable, not hard dependencies of `AGENTS.md`.
- High cohesion and low coupling govern every split made under this direction.
- Third-party libraries are vendored files rather than npm packages, and are therefore adapter-level and swappable. Alpine, Tailwind, GSAP, and Swiper are retained as current selections that test well for Shopify theme development, not as architecture.
- Library documentation reaches agents through Skills and MCP. Project conventions for using a library remain project-owned and belong with that adapter, not in the entry.
- The end state is a lean Skeleton standard reached through stepwise decisions, not a single refactor.

### Always-on entry direction

- `AGENTS.md` must remain complete for implementation-independent identity, safety, authority, merchant ownership, launch blockers, workflow, routing, validation, adapter guardrails, and accessibility safeguards.
- Current runtime names, typography tiers, motion-gate mechanics, and Tailwind placement rules must not be presented as settled mother-template contracts before review.
- The retained safeguard set is no longer listed here. `AGENTS.md` now carries it directly, so a copy in this file would be a second unowned source of the same rules, which is the defect D17 was raised to remove.

### P1+P5b Stage 2 - holdover placement

- Scope: place rules 5 and 11 with their then-decided owners and remove their pending-decision labels from `AGENTS.md`.
- Dependencies: the accepted JavaScript core and event conventions, plus the CSS placement rule, which is now recorded in `docs/references/style-system/css-architecture.md`. All resolved.
- Acceptance: both rules have exactly one owner; no protection is lost in transit; `AGENTS.md` ends at 6 implementation rules.
- Status: unblocked 2026-09-20. Not started.

The earlier D22 and D23 labels referred to documentation-ownership questions. Their actionable content is the migration table below; use that table rather than carrying orphan decision IDs with no standalone definition.

Pending migrations owned by this batch:

| Content still carried here | Intended destination |
| --- | --- |
| Accepted Skeleton architecture | A matching existing or newly approved `docs/references/` owner |
| Classification vocabulary | `AGENTS.md` or a matching reference |
| `my-theme-1` read-only, Ceylune independence, one writer per worktree, and independent review of any executed batch regardless of who executed it | `AGENTS.md` |
| Coordinator/reviewer: inspect evidence, maintain records, propose bounded tasks, and verify results; read-only unless implementation is authorized | `.agents/roles/` or `AGENTS.md` |
| Project Skills wrap recurring executable capabilities; volatile tooling claims require dated authoritative evidence; the portable workflow stays in `AGENTS.md` rather than a new protocol file | `AGENTS.md` or a matching reference |
| Machine setup and client availability notes | `README.md` |
| Record lifecycle steps 6 and 7: accept only from review evidence and explicit user acceptance; after acceptance compress transient detail, remove obsolete board discussion, migrate stable contracts, and delete completed context entries | `AGENTS.md`, whose board/context rule currently carries recording and authorization but not the post-acceptance cleanup discipline. These two record files are construction-phase artifacts, so the discipline is lost when they are removed. |
| The implementation-surface versus record-layer distinction, and the rule that an execution spec states checks rather than claims | `AGENTS.md`. Both are architecture-independent method rules earned from P1+P5b Stage 1, and both currently live only in the Record Lifecycle of a file scheduled for removal. |
| The always-on entry principle: `AGENTS.md` stays complete for implementation-independent rules, and current runtime names, typography tiers, motion mechanics, and Tailwind placement are never presented as settled mother-template contract before review | `AGENTS.md`. Stage 1 applied this principle but did not state it anywhere, so nothing currently prevents the entry from re-accumulating implementation detail. |

Until migrated, retain these machine facts: Windows symlinks were repaired with repository-local `core.symlinks = true`; Developer Mode is optional; project Hooks require workspace trust and may not run on a first clone; and live Shopify Dev MCP/Context7 availability in Codex and Cursor remains unproven and must be rechecked before use.

### CSS architecture — settled 2026-09-20

Tailwind stays as the framework; component CSS lives in `{% stylesheet %}` blocks; shared vocabulary stays in the Tailwind build. The rule, the three placement constraints, the three Shopify bundled-asset tag constraints, the layer ownership table, and the Decision Flow now live in `docs/references/style-system/css-architecture.md`, which is the owner. The measurement that drove the decision is in git history and is not reproduced here.

Result across six batches: always-loaded CSS fell from 300,231 raw / 23,258 brotli to 173,783 / 15,778, a 42 percent raw and 32 percent brotli reduction. `lint:theme` now enforces the platform tag constraints that Theme Check does not. A keyboard focus ring that never rendered was fixed. Deletion was governed by a five-probe liveness check iterated to a fixpoint.

### Vendored GSAP Skills - two open follow-ups

Raised by the independent review of the accepted GSAP Skills batch on 2026-09-20. Neither blocked acceptance; neither is a plan.

**No drift or tamper detection.** The vendoring is a plain copy: no submodule, no subtree, no npm dependency, no upstream remote. Each `UPSTREAM.md` records the repository URL, the pinned revision `aed9cfd3277740755f6bfc1155c7aa645403b760`, the upstream path, and the license, but **not a content identifier**. A local edit to a vendored `SKILL.md` therefore cannot be detected without re-fetching upstream.

If this is closed, record the git blob ids, not a working-copy sha256. `.gitattributes` sets `* text=auto eol=lf` and this machine has `core.autocrlf=true`, so a working-copy sha256 depends on the checkout platform: `gsap-core/SKILL.md` hashes to `de938ee...` with CRLF and `3887b47e...` with LF. The blob ids are stable everywhere and equal upstream's own object ids, verified 2026-09-20 against `aed9cfd`:

| Skill | Blob id |
| --- | --- |
| `gsap-core` | `98639432f4112b664aa5e53cf5d8ea1a4697eff9` |
| `gsap-timeline` | `1fed372b0e5276b2a207d80bc23f81180a0dff55` |
| `gsap-scrolltrigger` | `6d8c09f2136c108595c9e0db859c4a39460e99cf` |
| `gsap-performance` | `05792acf5b0ea7fd30042cdc5e91282e8e047898` |

Check with `git rev-parse HEAD:.agents/skills/<name>/SKILL.md`.

**Upstream descriptions compete with project motion policy.** A skill's `description` is its auto-trigger surface. `gsap-scrolltrigger` says "Recommend GSAP for scroll-driven animation when no library is specified" and `gsap-core` says "Recommend GSAP when the user needs timelines, scroll-driven animation, or a framework-agnostic library". An agent asked for ordinary scroll reveal can load either before reaching `motion-architecture.md`. `AGENTS.md` and each `UPSTREAM.md` state the boundary in prose, but prose does not change the trigger surface.

The two candidate resolutions conflict, so this needs a decision rather than an edit: byte-identical vendoring keeps updates auditable and cheap to re-pull, while a project-side `when_to_use` override or a description rewrite fixes the trigger but makes every upstream update a manual merge. The review's recommendation was to keep byte identity and rely on `AGENTS.md`, revisiting only if a real misroute is observed.

### P4 - License

- Scope: decide distribution intent, then align the `ISC` value in `package.json`.
- Dependencies: user decision on distribution intent.
- Acceptance: the decision is recorded and package metadata agrees with it; no unrelated package changes.
- Status: not started.

### Post-DR-1 cleanup candidates (found in the DR-1 review, 2026-09-21)

Each needs its own authorized batch.

- **Unreachable factories with dead dialog calls.** No Liquid file mounts `newsletterBanner` or `newsletterOverlay` (`assets/alpine.components.overlays.js`), or `productCard` and `cardGallery` (`assets/alpine.components.product-cards.js`). Their `$store.dialog` calls (`overlays.js:132,136`, `product-cards.js:299,336`) target a store that no longer exists. This is the same class of finding as UC-1: retire the factories or reconnect them.
- **Merchant-facing dialog settings with no consumer.** `config/settings_schema.json:847-871` holds the `dialog_*` theme settings (border, radius, shadow). `snippets/css-variables.liquid:156-162` emits them as `--dialog-*`, and no CSS reads them now. Removing them changes the Theme Editor, so it needs an explicit decision.
- **Dead `scroll-lock` rule.** `assets/base.css:16` (and the generated output) styles `dialog[scroll-lock][open], details[scroll-lock][open]`, but no markup sets a `scroll-lock` attribute.

### Post-CSS acceptance cleanup candidates

The CSS series is accepted. These candidates were left out of it and need their own authorized batch.

- Remove or otherwise resolve the eight dead class symbols that remain inside retained multi-selector rules: `is-open`, `panel-motion-content`, `panel-motion-disclosure`, `panel-motion-popover`, `panel-motion-shell`, `tab-content-underlined`, `tab-control-underlined`, and `tab-header-underlined`.
- Update the stale `cart-overlay` mention in the `tailwind/tailwind.components.css:1010` comment. The cart overlay was retired by UC-1.

## Next Work

The CSS series, the motion foundation, the GSAP Skills tooling, and the dialog/drawer work (MS-1 ownership foundation, MS-2 modal-chain retirement) are all accepted. UC-1 (retirement of the unreachable cart overlay, related-products, pickup and super-menu implementations, plus Ceylune content) and TM-1 (theme metadata pointed at this repository) are accepted as of 2026-09-21. TB1 (the Container host and the four-block rework) is accepted as of 2026-09-21. AC-1 (invalid alpha color syntax corrected and guarded by `lint:theme`) is accepted as of 2026-09-21. DR-1 (drawer retired together with collection filtering, sorting and navigation; collection pagination now uses `sectionPagination`) is accepted as of 2026-09-21. `context.md` holds no plan.

1. Select one decision and record it in `context.md` before execution. Ready candidates: typography's token boundary, and the post-DR-1 cleanup candidates above.
2. The eight dead `panel-motion-*` / `tab-*-underlined` symbols remain a small separate cleanup candidate.
3. P1+P5b Stage 2 is unblocked but unscheduled and needs explicit authorization. P4 waits only on a distribution-intent decision.

## Deferred Extraction Goal

After this workflow is proven through real theme batches, evaluate extracting the portable board/context lifecycle, vendor-neutral roles, and thin client adapters into a reusable development template. Do not extract theme-specific rules, validators, or references as generic workflow infrastructure.

---

## Active decision and later candidates

No decision is active and `context.md` holds no plan. Promote exactly one ready candidate.

### Motion — settled 2026-09-20

The motion baseline, the native reveal mechanism, and the public protocol were decided and implemented. The contract is owned by `docs/references/architecture/motion-architecture.md`: three authored attributes (`data-motion-section`, a valueless `data-motion-reveal`, `data-motion-critical`), one merchant setting (`motion_enabled`), Intersection Observer plus CSS transitions, and the rule that CSS never hides an authored target without a runtime state attribute — which `lint:theme` now enforces across `tailwind/`, `assets/*.css`, and `{% stylesheet %}` blocks.

Result: the reveal surface fell from roughly 71,232 raw / 8,454 Brotli bytes to a small adapter plus a single CSS block, six authored attributes and four merchant settings retired, and worst-case reveal delay cut from 4,990ms to 1,760ms independent of pagination size.

Still open, and deliberately outside that work:

- Drawer motion: retired with the drawer by DR-1. `docs/references/architecture/motion-architecture.md` states that a derived theme adding a drawer owns its motion under the `prefers-reduced-motion` policy.
- View Transitions, deferred for genuine page and shared-element transitions rather than ordinary reveal or drawers.
- GSAP runtime vendoring, loading boundary, and licensing records. GSAP is approved as the dynamically loaded engine for explicit complex choreography, but no retained consumer exists, so nothing is vendored. The four official documentation Skills are installed and accepted as agent tooling only.
- Three.js as an optional, consumer-loaded 3D adapter.

### Color chain — retain, and it is already protected

Agreed with the user's reading. `color-*` is built dynamically from `color-{{ section.settings.color_scheme }}`, is merchant-driven, and matches the official Skeleton's own color-scheme support. CSS-1 probe P5 already treats the whole family as live, so no deletion pressure reaches it. Nothing to decide unless the token boundary changes.

### Typography — the measurement contradicts the intuition

The user's reading was that fonts need redoing or minimizing. **Minimal is already true, and redoing is the most expensive of the three for the least byte payoff.**

- `tailwind.typography.css` is 7,416 bytes: 3.8 percent of the 193,845-byte hand-written total, the smallest of the six files.
- It is the most alive: 17 of 23 selectors referenced, 74 percent, against 6 percent for `tailwind.snippets.css`.
- It is not ad-hoc. `heading-base` carries the shared declarations and each tier adds one `font-size` over `--font-heading-scale`, so the tiers are token-driven rather than duplicated.
- It is the only one of the three that is **merchant-facing**. Those 17 classes are `{% schema %}` option values reached through `section.settings.heading_size`, so changing the vocabulary changes merchant-selectable settings and requires a `config/settings_data.json` and `templates/*.json` migration decision, which is the boundary this project protects hardest.

If a typography decision is selected, the defensible unit is the **token boundary** — which `--font-*` variables the Skeleton owns and how a derived theme overrides them — not the tier class vocabulary. Rewriting the vocabulary should be argued on merchant-facing grounds, if at all; it cannot be argued on payload.

## Deferred Discussion Backlog

These topics are not active yet. Promote one only when its prerequisites are satisfied and it is selected as the sole current decision.

- Theme Block schemas, allowed parents, and external-input contracts beyond TB1.
- Image, video, and product-media ownership. When decided, revisit whether the Container host (`sections/custom-section.liquid`) gains the official Skeleton's `background_image` setting, which TB1 deliberately omitted.
- Global page, Section, and Block layout protocol.
- Accessibility, SEO, performance, compatibility, and final test gates.
- Remaining cross-client capability and fallback differences, including live MCP availability in Cursor and Codex.
