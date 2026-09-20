# Work Board

This board is the discussion surface for active and deferred decisions: evidence, alternatives, disagreements, and questions that have not yet reached an accepted direction.

- `context.md` holds exactly one selected current plan, including its dependencies, authorization, execution, validation, and acceptance status, or no plan. Unselected and unscheduled work remains here.
- Selecting and recording a plan does not authorize execution. Execution requires explicit user authorization for that batch and resolved dependencies.
- On acceptance, clear the completed plan from `context.md`, migrate durable contracts to `AGENTS.md`, code, configuration, or the matching reference, and remove obsolete discussion from this board.
- Delivering an execution prompt does not complete a batch. Completion requires implementation, validation, independent review, and user acceptance.
- **One decision is active at a time.** Evidence that several decisions share lives under Shared Evidence, not inside whichever decision happened to surface it. A discussion that accumulates unrelated decisions is split before it grows further.
- This file and `context.md` are construction-phase records. Migrate lasting rules and remove both when the Skeleton is complete.

Last updated: 2026-09-20.

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

### JavaScript holding CSS animation names

`dialog-motion.js` and `drawer-motion.js` hardcode CSS animation names such as `dialog-motion-dock-enter` in JavaScript, while the definitions live in the stylesheets. The JavaScript compares `event.animationName` on `animationend` against those name sets, so the two sides are coupled by string. The markup contract is a set of `data-*` attributes in `snippets/ui-dialog.liquid` (`data-dialog-motion-mode`, `data-dialog-motion-target`, `data-dialog-motion-backdrop`, `data-dialog-motion-edge`, `data-drawer-motion`, `data-drawer-motion-slide`, `data-drawer-motion-sheet-below-pc`, `data-drawer-motion-target`, `data-drawer-motion-backdrop`), plus the merchant-level gate `settings.motion_enabled` rendered as `data-motion-enabled` in `layout/theme.liquid`.

Measured 2026-09-18: the two files are 9,658 and 7,662 bytes, 17,320 together, and both are statically reachable from `base.js` through `alpine.store.dialog.js`. That is 25 percent of the 69,382-byte always-loaded module graph recorded in `docs/references/architecture/javascript-runtime.md`. Whether this motion layer stays in the Skeleton at all, and if it stays who owns the animation names, belongs to the CSS side of this series. Still open after the JavaScript migration.

---

## Pending decisions and migration work

Nothing below is a plan. Each item needs a decision before it can become one.

### Accepted architecture awaiting permanent ownership

- The official Skeleton inventory and explicitly accepted project additions stay available through minimal, industry-neutral implementations and the smallest useful main-section compositions. Current project additions include the lifecycle/runtime and Agent/tooling configuration; finished-theme business features are not inferred.
- The accepted initial Theme Block inventory is `group`, `heading`, `text`, and `button`: group owns child composition; heading separates semantic level from visual tier; text owns non-heading rich text; button owns navigation-style calls to action. `image` remains deferred to the media contract; do not migrate `snippets/image.liquid` or turn preview-only Liquid features into undeclared stable requirements.
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

### TB1 rework

- Scope: rework the provisional `group`, `heading`, `text`, and `button` Theme Blocks and the `custom-content` host against the accepted JavaScript contract and the accepted CSS placement rule. Resolve the mobile `body-md` size mismatch, blank heading output, ineffective blank-link `aria-disabled`, and undecided group/style and primitive ownership.
- Dependencies: accepted JavaScript architecture and the CSS placement rule, both settled. The `blocks/` `@source` gap is closed.
- Acceptance: ownership boundaries remain intact; known semantic, accessibility, typography, and placement issues are resolved; no merchant-owned configuration changes; change-specific validation passes.
- Status: unblocked 2026-09-20. Not started.

### P4 - License

- Scope: decide distribution intent, then align the `ISC` value in `package.json`.
- Dependencies: user decision on distribution intent.
- Acceptance: the decision is recorded and package metadata agrees with it; no unrelated package changes.
- Status: not started.

### Post-CSS acceptance cleanup candidates

These are not part of the active CSS acceptance plan and must not be folded into it without a new authorized batch.

- Remove or otherwise resolve the eight dead class symbols that remain inside retained multi-selector rules: `is-open`, `panel-motion-content`, `panel-motion-disclosure`, `panel-motion-popover`, `panel-motion-shell`, `tab-content-underlined`, `tab-control-underlined`, and `tab-header-underlined`.
### Unreachable JavaScript components, DOM contracts, and orphaned schema (measured 2026-09-20)

**Open question:** should the unreachable JavaScript components, their DOM contracts, and the orphaned schema option be retired or reconnected? Not active while the CSS series is being accepted. Both findings predate CSS-1 and are visible at `21c3ddb`.

**`SectionRefresher` `innerSelectors` path — no reachable flow today.**

- `assets/alpine.components.overlays.js:594` sits in `cartOverlay`, which no Liquid file mounts. Only `cartPage()` is mounted, at `sections/cart.liquid:8`.
- `sections/collection.liquid:12` calls `collectionFilters()` with no arguments, so `selectors` is null and `buildDomMap()` never sets `innerSelectors`; collection filtering and pagination take the full-section path.
- `assets/alpine.components.product-cards.js:477` and `assets/alpine.components.product.js:1339` target `data-related-products-content` and `data-pickup-availability-*`, none of which exist in any Liquid file.

The validator tests for `carryInnerSectionStylesheet` are therefore the only automated coverage the production method can have until a flow is reconnected.

**`header-super-menu-*` CSS — no rendering path.**

- `sections/header.liquid` still carries `header-super-menu-*` rules in its `{% stylesheet %}` block.
- The schema still offers `menu_type = super`, but line 116 always renders `header-dropdown-menu`.

## Next Work

The CSS series is complete and accepted. One decision is active at a time; select one of the following.

1. **Select the next decision.** The three candidates recorded below — motion, typography, and the unreachable-component question — are all ready. Motion has the strongest evidence and partly resolves itself; typography's measurement contradicts the intuition that drove it; the unreachable components are a cleanup with no design content.
2. **Or execute an unblocked plan.** P1+P5b Stage 2 and TB1 rework both unblocked on 2026-09-20 now that the CSS placement rule exists. Each still needs explicit authorization before execution.
3. P4 (license) remains an independent later choice, waiting only on a distribution-intent decision.

## Deferred Extraction Goal

After this workflow is proven through real theme batches, evaluate extracting the portable board/context lifecycle, vendor-neutral roles, and thin client adapters into a reusable development template. Do not extract theme-specific rules, validators, or references as generic workflow infrastructure.

---

## Candidate next decisions after CSS-1

Raised by the user on 2026-09-20 while CSS-1 executes. **None of these is active.** They are recorded with the evidence each already has, so the next decision can be selected rather than re-derived. Select exactly one when CSS-1 is accepted.

### Motion — strongest case, and partly self-resolving

`tailwind.animates.css` is 43,105 bytes, 21 selectors, 1 referenced, and that one is `animate-spin`, which Tailwind provides natively. Its remaining selectors name Ceylune-era sections D24 deleted: `watermark-marquee`, `scrolling-icon-with-text__marquee`, `icons-animate-*`. CSS-1 Stage A removes nearly all of it under the liveness check, so this decision does not need to fund the demolition.

What survives the demolition is the real question, already on this board under **Open Evidence**: `dialog-motion.js` and `drawer-motion.js` are 17,320 bytes, 25 percent of the always-loaded module graph, and they couple to CSS by hardcoded animation-name strings compared against `event.animationName`.

A new approach worth evaluating: Shopify's current theme guidance names the **View Transitions API** under its design requirements. That would replace the `animationend` name-matching contract with a platform primitive and could retire both files. Two things must be checked before it is proposed, not assumed: whether it clears the repository browser matrix (`last 2 Safari major versions`, `last 3 Firefox`, `last 2 iOS`), which `npm.cmd run lint:compat` answers directly; and whether the retained dialog and drawer flows can express their motion through it without losing the reduced-motion gate and the `settings.motion_enabled` merchant control.

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

- Theme Block schemas, allowed parents, and external-input contracts beyond provisional TB1.
- Image, video, and product-media ownership.
- Global page, Section, and Block layout protocol.
- Accessibility, SEO, performance, compatibility, and final test gates.
- Remaining cross-client capability and fallback differences, including live MCP availability in Cursor and Codex.
