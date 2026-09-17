# Work Board

This board is the discussion surface for active and deferred decisions: evidence, alternatives, disagreements, and questions that have not yet reached an accepted direction.

- After the user accepts a direction, remove the resolved discussion from this board and record the resulting state, dependencies, and authorization status in `docs/agent/context.md`.
- Recording a plan in `context.md` does not authorize execution. Execution requires explicit user authorization for that batch and resolved dependencies.
- Keep accepted implementation state, validation, and the execution queue in `context.md`; keep durable contracts in `AGENTS.md`, code, configuration, or the matching reference.
- Delivering an execution prompt does not complete a batch. Completion requires implementation, validation, and user acceptance.
- **One decision is active at a time.** Evidence that several decisions share lives under Shared Evidence, not inside whichever decision happened to surface it. A discussion that accumulates unrelated decisions is split before it grows further.
- This file and `context.md` are construction-phase records. Migrate lasting rules and remove both when the Skeleton is complete.

Last updated: 2026-09-17.

Decision IDs are labels, not an index. The sequence has gaps: D4 through D14 were never recorded in any committed document and survive only in early chat history, and D18 was assigned and retired within a single session. A missing number means no record exists, not that a record was lost.

---

## How these decisions are made

Stated by the user on 2026-09-17 and applied from here on.

The files under `docs/references/` describe the current Ceylune-derived implementation. They are **evidence of what exists, never authority over what should be built**. Quoting a reference as a constraint argues from the artifact this project is replacing, and is not a valid objection to a proposed architecture.

The Skeleton's architecture is decided from two sources only: **Shopify's current official best practice**, and **the user's stated intent**. Once a decision is accepted, the references are rewritten to match it; they are an output of the decision, not an input to it.

One caveat does bind: the real constraint is the code, not the documentation. Deleting a rule does not delete the runtime JavaScript or the 27 classic script tags that implement it. Existing code is measured as migration debt against the accepted target, and is never a reason to lower the target.

Authoritative sources for this series: `shopify.dev/docs/storefronts/themes/best-practices`, `.../theme-features`, `.../store`, and `github.com/Shopify/skeleton-theme`. Theme Store *optional* declarations are out of scope for the Skeleton.

---

## Open Evidence

### JavaScript holding CSS animation names

`dialog-motion.js` and `drawer-motion.js` hardcode CSS animation names such as `dialog-motion-dock-enter` in JavaScript, while the definitions live in the stylesheets. Ownership of those names, and whether JavaScript may know them at all, belongs to the CSS side of this series. Still open after the JavaScript migration.

### One official recommendation not yet covered by any decision

The themes Performance best-practices index rates "render essential content in Liquid and HTML, not JavaScript" as LCP High. No decision has addressed it. It constrains what an adapter may render, and the CSS and component discussions inherit it.

## Blocked — TB1 rework

- TB1 is implemented and validated but provisional, not an accepted Skeleton contract. It added the four Theme Blocks and the `custom-content` host without modifying merchant-owned template JSON.
- TB1 rework must resolve the mobile `body-md` size mismatch, blank heading output, ineffective blank-link `aria-disabled`, and the undecided group/style and primitive ownership. It remains blocked by the JS/CSS decisions, including D3.


Returned from `context.md` on 2026-09-18: TB1's provisional status and its rework issues are a blocked plan, not the plan under execution.

---
## Returned from context — 2026-09-18

These are leftovers from earlier discussion that were sitting in `context.md` without being part of any executing plan: accepted directions with no scheduled batch, holdovers, queued topics, and the pending-migration list. `context.md` holds only the plan under execution, so they belong here, where discussion selects what becomes the next plan.

Nothing below is a plan. Each item needs a decision before it can become one.

### Accepted architecture awaiting permanent ownership

- Required Shopify capabilities stay available through minimal, industry-neutral implementations and the smallest useful main-section compositions.
- The accepted initial Theme Block inventory is `group`, `heading`, `text`, and `button`: group owns child composition; heading separates semantic level from visual tier; text owns non-heading rich text; button owns navigation-style calls to action. `image` remains deferred to the media contract; do not migrate `snippets/image.liquid` or turn preview-only Liquid features into undeclared stable requirements.
- A generic block may vary appearance while preserving semantics, but must not collect unrelated ownership, business semantics, or behavior modes merely to reuse markup.
- Liquid July '26 `{% block %}` and `{% partial %}` features are not stable requirements. Any `{% partial %}` trial must be low risk and verify ordinary rendering, Theme Editor behavior, accessibility state, request races, Alpine lifecycle, and custom component lifecycle.
- `ShopifySectionRefresher` remains transitional while retained flows depend on Section Rendering API behavior; removal requires approved replacements with explicit lifecycle, accessibility, error, and history ownership.
- Tailwind remains, targeting a fixed `@source inline(...)` vocabulary with `source(none)`. Ordinary section work becomes buildless after the manifest is established; `npm.cmd run build:tw` is then needed only when the vocabulary changes.
- Component-specific CSS belongs with its section, block, or snippet; shared tokens, typography, surfaces, layout vocabulary, and reusable motion remain global. Use manifest utilities before local styles; reserve local styles for selectors, pseudo-elements, keyframes, container queries, `:has()`, grid templates, and exact values outside the manifest.
- Manifest contents, token boundary, generated stylesheet name, Swiper ownership, and the final reference rewrite remain open. No CSS implementation batch has started.

### Pluggable-core direction

Stated and confirmed by the user on 2026-09-17 as the Skeleton's target shape. The individual decisions that realize it are unresolved and live on the board.

- The always-loaded entry owns thinking method and SOP. Typography, JavaScript, and library choices are pluggable, not hard dependencies of `AGENTS.md`.
- High cohesion and low coupling govern every split made under this direction.
- The invariant core is the project's own runtime: the component registry and its lifecycle contract.
- Third-party libraries are vendored files rather than npm packages, and are therefore adapter-level and swappable. Alpine, Tailwind, GSAP, and Swiper are retained as current selections that test well for Shopify theme development, not as architecture.
- Library documentation reaches agents through Skills and MCP. Project conventions for using a library remain project-owned and belong with that adapter, not in the entry.
- On-demand loading is a goal for the JavaScript layer.
- The end state is a lean Skeleton standard reached through stepwise decisions, not a single refactor.

### Always-on entry direction

- `AGENTS.md` must remain complete for implementation-independent identity, safety, authority, merchant ownership, launch blockers, workflow, routing, validation, adapter guardrails, and accessibility safeguards.
- Current runtime names, typography tiers, motion-gate mechanics, and Tailwind placement rules must not be presented as settled mother-template contracts before review.
- The retained safeguard set is no longer listed here. `AGENTS.md` now carries it directly, so a copy in this file would be a second unowned source of the same rules, which is the defect D17 was raised to remove.

### P1+P5b Stage 2 - holdover placement

- Scope: place rules 5 and 11 with their then-decided owners and remove their pending-decision labels from `AGENTS.md`.
- Dependencies: accepted JS/CSS architecture decisions covering JavaScript core and event conventions, and CSS manifest and placement.
- Acceptance: both rules have exactly one owner; no protection is lost in transit; `AGENTS.md` ends at 6 implementation rules.
- Status: blocked by the JS/CSS discussion.

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

### JS/CSS architecture discussion

- Scope: decide utility manifest and D3, CSS placement, typography tiers, button and surface primitives, JavaScript core/runtime conventions, and Alpine scope.
- Dependencies: accepted P1+P5b Stage 1 result. Resolved 2026-09-17.
- Acceptance: each decision, dependency, unresolved risk, and resulting implementation batch is recorded here; D3 is resolved; no theme implementation is mixed into the discussion batch.
- Status: **decision review on the board**. Accepted and recorded here: D19 Part A and D21. Resolved and awaiting acceptance there: D20, D24, and a corrected JavaScript-only migration plan. D22 and D23 are documentation-ownership questions and D3 is a CSS question; none blocks this execution. D24 implementation, including inventory deletion and minimal-section rewrites, is separated from the JavaScript migration.

### TB1 rework

- Scope: rework the provisional blocks against accepted JS/CSS decisions and resolve every recorded TB1 issue.
- Dependencies: accepted JS/CSS architecture decisions.
- Acceptance: ownership boundaries remain intact; known semantic, accessibility, typography, and placement issues are resolved; no merchant-owned configuration changes; change-specific validation passes.
- Status: blocked.

### CSS manifest implementation

- Scope: define and measure the fixed Tailwind vocabulary and global/local CSS ownership, including retained consumers and existing `{% stylesheet %}` placements.
- Dependencies: accepted JS/CSS decisions and D3.
- Acceptance: isolated measurement does not overwrite the tracked generated stylesheet; old animation layers, reset/token ownership, generated asset name, retained consumers, and local placements are classified; raw, gzip, and brotli sizes are reported with and without Swiper.
- Status: blocked.

### P4 - License

- Scope: decide distribution intent, then align the `ISC` value in `package.json`.
- Dependencies: user decision on distribution intent.
- Acceptance: the decision is recorded and package metadata agrees with it; no unrelated package changes.
- Status: not started.

## Next Work

1. Verify and accept JS1 in `context.md`: browser pass on a dev store, then a review of its five stages read together. On acceptance its decision blocks migrate to `docs/references/` and `context.md` returns to zero plans.
2. Then pick the next discussion from Returned from context or the backlog below, and take it one decision at a time until it becomes a single plan.
3. TB1 rework, the CSS manifest, and P4 each become a plan only after the discussion they depend on is accepted.

## Deferred Extraction Goal

After this workflow is proven through real theme batches, evaluate extracting the portable board/context lifecycle, vendor-neutral roles, and thin client adapters into a reusable development template. Do not extract theme-specific rules, validators, or references as generic workflow infrastructure.

---

## Deferred Discussion Backlog

These topics are not active yet. Promote one only when its prerequisites in `context.md` are satisfied.

- The future CSS architecture discussion must inventory the old animation layers, reset and token-bridge ownership, generated asset name, retained class consumers, and existing `{% stylesheet %}` placements.
- Theme Block schemas, allowed parents, and external-input contracts beyond provisional TB1.
- Image, video, and product-media ownership.
- Global page, Section, and Block layout protocol.
- Utility manifest families, scale steps, variants, output size, token boundary, stylesheet name, and Swiper CSS ownership.
- Typography tier design and body-copy sizing.
- JavaScript core, business modules, ESM, import maps, and on-demand loading.
- Alpine scope and initialization order.
- Accessibility, SEO, performance, compatibility, and final test gates.
- License and distribution model.
- Remaining cross-client capability and fallback differences, including live MCP availability in Cursor and Codex.
