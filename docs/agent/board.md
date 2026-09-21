# Work Board

This board holds the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Accepted contracts belong in `AGENTS.md`, a routed reference, code, or configuration; completed execution history belongs in Git.

Last updated: 2026-09-22.

## Current position

- The mother template follows Shopify's official `skeleton-theme` storefront inventory plus the explicitly accepted additions listed in `AGENTS.md`. Derived themes own business features, visual identity, and Theme Store positioning.
- The focused closeout is complete as of 2026-09-22. The template kept only accepted primitives, then stripped the old theme's design residue. Third-party notices are in `THIRD_PARTY_NOTICES.md`. `npm.cmd run lint` and `npm.cmd test` pass. The user's desktop and mobile browser pass found no functional problem; the remaining visual rough edges from the strips are accepted as a neutral baseline for derived themes to style.
- `context.md` holds no plan. No active decision is open; the user will share their final direction for the template.

## Deferred ideas

- **GSAP documentation Skills:** The vendored skills are pinned to upstream revision `aed9cfd3277740755f6bfc1155c7aa645403b760`. A plain copy has no drift check. The stable upstream Git blob IDs are `98639432f4112b664aa5e53cf5d8ea1a4697eff9` (core), `1fed372b0e5276b2a207d80bc23f81180a0dff55` (timeline), `6d8c09f2136c108595c9e0db859c4a39460e99cf` (scrolltrigger), and `05792acf5b0ea7fd30042cdc5e91282e8e047898` (performance). Upstream skill descriptions can suggest GSAP for ordinary scroll reveal despite the project's native-motion policy. Keeping byte-identical vendoring is preferred until an actual misroute justifies a project override.
- **Build and library choices:** A fixed Tailwind `@source inline(...)` vocabulary with `source(none)` measured 4,934 Brotli bytes and could make routine section work buildless; it is a workflow choice. Generated stylesheet naming is a future decision; Swiper is vendored only when an accepted carousel consumer exists. GSAP runtime and Three.js stay unloaded without an accepted consumer; View Transitions remain optional.
- **Future storefront design:** Theme Block schemas and allowed parents beyond TB1; image/video/product-media contract and possible Container `background_image`; global page/Section/Block layout protocol. These are future capability decisions unless a retained flow is broken. The accepted initial Theme Block contract lives in `docs/references/architecture/theme-blocks.md`.
- **Tooling and extraction:** Recheck live Shopify Dev MCP/Context7 availability in a client before using it. Consider extracting portable agent workflow only after real theme batches prove it. Neither is a storefront completion gate.

## Closed decisions relevant to scope

- Color scheme classes are merchant-driven and retained; the CSS reference owns their token contract.
- Ordinary section reveal uses the native motion protocol. Drawer motion was retired with the drawer. The motion reference owns the remaining contract.
- The user chose to keep existing evidence/source rules rather than add a separate dated-evidence Skills rule.
- The P4 license follows Shopify Skeleton's actual license text; commit `83ff2d7` contains the implementation and acceptance record.
- The mother-template scope was closed on 2026-09-22 (CL-1 to CL-6, the Alpine notice, and the release gate). The accepted storefront primitives are listed in `AGENTS.md`; design-specific behavior belongs to derived themes.
