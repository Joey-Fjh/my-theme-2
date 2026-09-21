# Work Board

This board holds the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Accepted contracts belong in `AGENTS.md`, a routed reference, code, or configuration; completed execution history belongs in Git.

Last updated: 2026-09-22.

## Goal and deadline

Finish the Skeleton mother template on 2026-09-22 (user's estimate). Done means: the storefront defaults below are settled, the JS/CSS architecture has passed an independent review, the Agent layer is a small set of fixed SOPs, every validator has a recurring purpose, and `npm.cmd run lint` and `npm.cmd test` pass.

Working discipline for this goal: think each decision through once, record it, execute, and review. Do not expand documents or reopen accepted decisions to be thorough. Speed must not replace checking.

## Current position

- CL-1 to CL-6, the Alpine notice, the release checks, and the desktop/mobile browser pass were accepted on 2026-09-22 (commits `00229b6`, `c3b3d7c`). The direction below revisits defaults and the Agent layer; it does not undo that acceptance.
- `context.md` holds no plan. The user asked to record and tidy this direction without starting implementation.

## User direction (2026-09-22)

- **Purpose:** This template turns Shopify's official Skeleton plus proven practice into a fixed standard: a settled framework and SOPs that agents follow rather than improvise. The problems to prevent are drift from the goal, over-discussion, and context overfilling in long agent sessions.
- **Scope boundary:** `my-theme-1` stays read-only and out of scope. The user will raise any follow-up work there once this template is finished; do not plan or record it here.
- **Architecture (main remaining work):** Keep the Alpine component/lifecycle adapter, the no-bundler import-map runtime, and Tailwind with the CSS token chain. No Vue or bundler. Complete it and have it independently reviewed; do not add storefront features to exercise it.
- **Starter storefront:** Richer than the official Skeleton, but generic fundamentals only.
  - Remove Toast. Feedback belongs where the action happens: button loading/success/error states and inline messages.
  - Remove the cart drawer mode. The mother template keeps the cart page only. Derived themes may add a drawer.
  - Remove the current product card styling. Keep the product-card global settings at a minimal set as the anchor for derived themes, and record the contract they will build on.
  - Keep the color scheme chain. Fonts: keep the font architecture; detailed controls and defaults are still to be discussed.
- **Agent layer:** Most of `AGENTS.md` and `docs/references/` is loaded or linked but rarely read. Replace explanation with fixed SOP workflows that the user can read and follow. The tidied `AGENTS.md` constraints then serve as the workflow. Keep the needed MCP servers and official/third-party Skills; keep self-built Skills and validators only when they have a recurring SOP or proven validation value.

## Sequence (one decision at a time)

1. **Active — Toast and cart drawer removal.** Replace every Toast feedback path with local feedback, then remove Toast and the `drawer` cart type.
2. Product card: remove the styling, reduce the global settings, and record the contract.
3. Fonts: decide the controls and defaults.
4. JS/CSS architecture: independent review against the references, then fixes.
5. Agent layer and validators: rewrite `AGENTS.md` and `docs/references/` into fixed SOPs, and audit every validator (keep, merge, or remove).

The Agent layer comes last so it describes the final architecture once.

## Evidence for the sequence

- **Toast and drawer (step 1):** `cart_type` still defaults to `drawer`, although the drawer was retired; `config/settings_data.json` does not override it. `cart_type` is read by `layout/theme.liquid` (`data-cart-type`), `sections/product.liquid`, and `snippets/buy-buttons.liquid`. Buy buttons use Toast for non-page success. Toast also reports cart failures, quantity limits, and contact success. Map every path before removing the Toast store, container, settings, locale copy, CSS, and module entry. `config/settings_data.json` stores `toast_position`; editing it needs the user's authorization inside the batch. `AGENTS.md` lists Toast as an accepted primitive; update it when the batch is accepted.
- **Product card (step 2):** `sections/collection.liquid` renders a simple listing. The global `config.product_cards` group has eight settings (image ratio, border thickness, radius, and shadow opacity, offsets, and blur) that emit CSS variables with no storefront consumer.
- **Fonts (step 3):** Two global `font_picker` settings and their `font_face`/token chain are sound; the many typography knobs and their defaults need review. Input and button base styles have consumers outside blocks, so removing editor controls must not remove shared accessible primitives. Visible focus stays a global accessibility rule; whether focus width and offset need merchant controls is open. The only animation setting is `motion_enabled`.
- **Global settings reference (steps 2–3):** Use [Horizon's settings schema](https://github.com/Shopify/horizon/blob/main/config/settings_schema.json) to decide which layer owns a setting, not as a feature checklist. Global settings govern shared policy (logo, typography, colors, product card, cart, animation, focus, social links); Section/Block settings govern one instance.
- **Agent layer (step 5):** `AGENTS.md` is 225 lines; `docs/references/` has 9 documents; role contracts come as 3 roles × 3 client shims. Self-built validators: `check-i18n` and `check-theme-architecture`, with dedicated test suites `section-stylesheet-carry` and `motion-reveal-batch`. The `lint:theme` tab-accessibility rule has no target since the blog tabs were removed.

## Deferred ideas

- GSAP documentation Skills stay pinned as recorded in each skill's `UPSTREAM.md`; their descriptions do not override the native ordinary-motion policy. Runtime libraries are vendored only for accepted consumers.
- Tailwind's fixed source vocabulary and the generated stylesheet name are revisited only for a concrete workflow need. Theme Block scope, image/video behavior, and the page/Section/Block layout protocol are future feature work.
- Verify Shopify Dev MCP and Context7 availability when a task needs them. Extract a portable Agent workflow only after real batches prove it.

## Closed decisions relevant to scope

- Color scheme classes are merchant-driven and retained; the CSS reference owns their token contract.
- Ordinary section reveal uses the native motion protocol; the motion reference owns the contract.
- Existing evidence/source rules are kept; no separate dated-evidence Skills rule.
- The accepted storefront primitives are listed in `AGENTS.md`; design-specific behavior belongs to derived themes.
