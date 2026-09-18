# Work Board

This board is the discussion surface for active and deferred decisions: evidence, alternatives, disagreements, and questions that have not yet reached an accepted direction.

- `context.md` holds exactly one selected current plan, including its dependencies, authorization, execution, validation, and acceptance status, or no plan. Unselected and unscheduled work remains here.
- Selecting and recording a plan does not authorize execution. Execution requires explicit user authorization for that batch and resolved dependencies.
- On acceptance, clear the completed plan from `context.md`, migrate durable contracts to `AGENTS.md`, code, configuration, or the matching reference, and remove obsolete discussion from this board.
- Delivering an execution prompt does not complete a batch. Completion requires implementation, validation, independent review, and user acceptance.
- **One decision is active at a time.** Evidence that several decisions share lives under Shared Evidence, not inside whichever decision happened to surface it. A discussion that accumulates unrelated decisions is split before it grows further.
- This file and `context.md` are construction-phase records. Migrate lasting rules and remove both when the Skeleton is complete.

Last updated: 2026-09-18.

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
- Tailwind remains, targeting a fixed `@source inline(...)` vocabulary with `source(none)`. Ordinary section work becomes buildless after the manifest is established; `npm.cmd run build:tw` is then needed only when the vocabulary changes.
- Component-specific CSS belongs with its section, block, or snippet; shared tokens, typography, surfaces, layout vocabulary, and reusable motion remain global. Use manifest utilities before local styles; reserve local styles for selectors, pseudo-elements, keyframes, container queries, `:has()`, grid templates, and exact values outside the manifest.
- Manifest contents, token boundary, generated stylesheet name, Swiper ownership, and the final reference rewrite remain open. No CSS implementation batch has started.

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
- Dependencies: the accepted JavaScript core and event conventions, plus unresolved CSS manifest and placement decisions.
- Acceptance: both rules have exactly one owner; no protection is lost in transit; `AGENTS.md` ends at 6 implementation rules.
- Status: blocked by the remaining CSS discussion.

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

### Remaining architecture discussion

- Scope: decide the CSS architecture one question at a time: manifest boundary, placement, typography tiers, and button and surface primitives.
- Dependencies: accepted P1+P5b Stage 1 result. Resolved 2026-09-17.
- Next decision — D3: should `assets/base.css` and the `@theme inline` token bridge in `tailwind/tailwind.input.css` be included in the CSS manifest batch? Including them means classifying their ownership and retained boundary; it does not presume converting reset rules or every token into utilities.
- Acceptance: decide D3 from current repository evidence and the intended Skeleton boundary; record its dependency, unresolved risk, and effect on the later CSS manifest batch; do not mix CSS implementation into the discussion.
- Status: JavaScript implementation and lifecycle acceptance are complete. D3 is open and is the next discussion candidate; the remaining CSS questions stay queued behind it.

### TB1 rework

- Scope: rework the provisional `group`, `heading`, `text`, and `button` Theme Blocks and the `custom-content` host against the accepted JavaScript contract and the eventual CSS decisions. Resolve the mobile `body-md` size mismatch, blank heading output, ineffective blank-link `aria-disabled`, and undecided group/style and primitive ownership.
- Dependencies: accepted JavaScript architecture; unresolved CSS architecture and D3.
- Acceptance: ownership boundaries remain intact; known semantic, accessibility, typography, and placement issues are resolved; no merchant-owned configuration changes; change-specific validation passes.
- Status: blocked.

### CSS manifest implementation

- Scope: define and measure the fixed Tailwind vocabulary and global/local CSS ownership, including retained consumers and existing `{% stylesheet %}` placements.
- Dependencies: accepted JavaScript architecture; unresolved CSS decisions and D3.
- Acceptance: isolated measurement does not overwrite the tracked generated stylesheet; old animation layers, reset/token ownership, generated asset name, retained consumers, and local placements are classified; raw, gzip, and brotli sizes are reported with and without Swiper.
- Status: blocked.

### P4 - License

- Scope: decide distribution intent, then align the `ISC` value in `package.json`.
- Dependencies: user decision on distribution intent.
- Acceptance: the decision is recorded and package metadata agrees with it; no unrelated package changes.
- Status: not started.

## Next Work

1. Discuss and decide D3 only: whether the CSS manifest batch includes ownership classification for `assets/base.css` and the token bridge in `tailwind/tailwind.input.css`.
2. After D3 is accepted, take the remaining CSS questions one at a time before defining the CSS manifest implementation plan.
3. P1+P5b Stage 2, TB1 rework, and the CSS manifest remain blocked by those CSS decisions. P4 remains an independent later choice.

## Deferred Extraction Goal

After this workflow is proven through real theme batches, evaluate extracting the portable board/context lifecycle, vendor-neutral roles, and thin client adapters into a reusable development template. Do not extract theme-specific rules, validators, or references as generic workflow infrastructure.

---

## Deferred Discussion Backlog

These topics are not active yet. Promote one only when its prerequisites are satisfied and it is selected as the sole current decision.

- Theme Block schemas, allowed parents, and external-input contracts beyond provisional TB1.
- Image, video, and product-media ownership.
- Global page, Section, and Block layout protocol.
- Accessibility, SEO, performance, compatibility, and final test gates.
- Remaining cross-client capability and fallback differences, including live MCP availability in Cursor and Codex.
