# Work Board

This board holds the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Accepted contracts belong in `AGENTS.md`, a routed reference, code, or configuration; completed execution history belongs in Git.

Last updated: 2026-09-21.

## Current position

- The mother template follows Shopify's official `skeleton-theme` storefront inventory plus explicitly accepted project additions. Derived themes own business features, visual identity, and Theme Store positioning. The implementation and reference files describe what exists; they do not expand the target inventory by themselves.
- The CSS, motion, dialog/drawer, unreachable-code, Theme Block, governance, and P4 license batches recorded through commit `83ff2d7` are accepted. `context.md` holds no plan.
- Completion has not been established by those earlier batches. Remaining assets have not had one final reachability and ownership audit, and the final release validation/browser pass has not been recorded. This is a finite closeout problem, not a reason to execute every deferred idea.

## Closeout — accepted direction

Accepted by the user on 2026-09-21: option A, focused closeout. The mother template is ready when the official Skeleton inventory and accepted additions are intact, no confirmed code-owned launch blocker remains, the asset and license audit is resolved, `npm.cmd run lint` and `npm.cmd test` pass, and retained storefront flows pass a desktop and mobile browser review. Missing browser evidence is handed off and readiness stays unconfirmed. No new storefront capability is added to close the project.

CL-1 (principle migration, Alpine Intersect, Swiper and 17 icons removed, read-only inventory) is accepted as of 2026-09-21. `context.md` holds no plan. Later batches: fixes from the CL-1 inventory, the Alpine license notice, then the release gate and browser review.

## Evidence and likely closeout findings

- `assets/tailwind.output.css` is generated and loaded by both `layout/theme.liquid` and `layout/password.liquid`: 140,983 raw / 12,956 Brotli bytes on 2026-09-21. Its source is `tailwind/tailwind.input.css` plus imported layers and Liquid class scanning. `tailwind.components.css` is 33,742 raw bytes and `tailwind.elements.css` is 26,596; size alone does not establish unused rules. The earlier CSS series reduced measured always-loaded CSS by 42% raw / 32% Brotli at its acceptance point.
- Swiper vendor files and the unreachable Swiper branch in `assets/alpine.components.product-media.js` were removed in CL-1. Swiper remains the selected carousel library, vendored only when an accepted consumer exists.
- The P4 review found no Alpine license header in `assets/vendor-alpine.min.js`, and no Alpine notice file. CL-1 removed the unused Intersect plugin. This remains an open third-party notice issue. The decision is whether to restore an upstream notice through proper re-vendoring or carry it in a third-party notices file; verify the exact upstream license and distribution contents before implementing.

## Closeout findings from the CL-1 inventory

Re-derived by Claude with `git grep` on 2026-09-21 and verified against the worktree. Every non-Skeleton file has at least one reference; reachability was followed through import-map specifiers to `data-module-id` / `x-data` mount points, and through exported component factories to consumers outside their own file. Candidates for the next closeout batch:

| Item | Classification | Evidence |
| --- | --- | --- |
| `assets/drag-scroll.js`, import-map entry `drag-scroll`, factory `dragScroll` in `alpine.components.ui.js` | dead | No `data-module-id="drag-scroll"`, no `x-data="dragScroll"`; the wrapper module is the only importer |
| `assets/progressive-list.js`, import-map entry `progressive-list`, factory `progressiveList` in `alpine.components.ui.js` | dead | Same pattern: no mount point, wrapper is the only importer |
| `countdownTimer`, `flipDigit` in `alpine.components.ui.js` | dead | Zero references outside the file; no intra-file use |
| `imageMagnifier`, `beforeAfterComparison`, `mediaVideo` in `alpine.components.product-media.js` | dead | Zero references outside the file; no intra-file use |
| `ProductPrice`, `ProductPaymentTerms`, `GiftCardRecipient`, `SellingPlanPicker` in `alpine.components.product.js` | dead | Zero references outside the file; no intra-file use |
| `sections/article.liquid` `show_social` | undecided | `{%- if section.settings.show_social -%}{%- endif -%}` renders nothing; removal is a merchant-facing schema change |
| `eslint.config.cjs` `Swiper: 'readonly'` | stale | Swiper removed by CL-1; outside CL-1 surface |

Retained and live: every other import-map module has a mount point (`accordion`, `buy-buttons`, `cart-page`, `dropdown`, `footer-scroll-top`, `localization-switcher`, `motion-reveal-section`, `product-gallery`, `product-layout`, `quantity-selector`, `section-pagination`, `sticky-header`, `sticky-viewport-panel`, `tab-control`, `toast-container`, `variant-picker`) or a static importer (`motion-reveal-batch` from `motion-reveal-section.js`; `quantity-constraints.js` from `alpine.components.product.js`; `performance.js` dynamically from `base.js`); `gift-card.js`/`.css` load from `templates/gift_card.liquid`; all remaining icons resolve through literal `icon:` arguments or `sections/product.liquid` schema values.

## Deferred after focused closeout unless the audit finds a blocker

- **GSAP documentation Skills:** The vendored skills are pinned to upstream revision `aed9cfd3277740755f6bfc1155c7aa645403b760`. A plain copy has no drift check. The stable upstream Git blob IDs are `98639432f4112b664aa5e53cf5d8ea1a4697eff9` (core), `1fed372b0e5276b2a207d80bc23f81180a0dff55` (timeline), `6d8c09f2136c108595c9e0db859c4a39460e99cf` (scrolltrigger), and `05792acf5b0ea7fd30042cdc5e91282e8e047898` (performance). Upstream skill descriptions can suggest GSAP for ordinary scroll reveal despite the project's native-motion policy. Keeping byte-identical vendoring is preferred until an actual misroute justifies a project override.
- **Build and library choices:** A fixed Tailwind `@source inline(...)` vocabulary with `source(none)` measured 4,934 Brotli bytes and could make routine section work buildless; it is a workflow choice. Generated stylesheet naming and Swiper ownership remain future decisions if those capabilities survive the audit. GSAP runtime and Three.js stay unloaded without an accepted consumer; View Transitions remain optional.
- **Future storefront design:** Theme Block schemas and allowed parents beyond TB1; image/video/product-media contract and possible Container `background_image`; global page/Section/Block layout protocol. These are future capability decisions unless a retained flow is broken. The accepted initial Theme Block contract lives in `docs/references/architecture/theme-blocks.md`.
- **Tooling and extraction:** Recheck live Shopify Dev MCP/Context7 availability in a client before using it. Consider extracting portable agent workflow only after real theme batches prove it. Neither is a storefront completion gate.

## Closed decisions relevant to scope

- Color scheme classes are merchant-driven and retained; the CSS reference owns their token contract.
- Ordinary section reveal uses the native motion protocol. Drawer motion was retired with the drawer. The motion reference owns the remaining contract.
- The user chose to keep existing evidence/source rules rather than add a separate dated-evidence Skills rule.
- The P4 license follows Shopify Skeleton's actual license text; commit `83ff2d7` contains the implementation and acceptance record.
