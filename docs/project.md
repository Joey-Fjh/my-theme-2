# Project

This file holds what is specific to this repository: its identity, inventory boundary, and accepted storefront scope. `AGENTS.md` holds the rules shared by every theme built from it. Each theme owns and rewrites this file; do not copy it when syncing the Agent layer between themes.

## Identity

This is an internal Shopify Skeleton Theme mother template for building future themes: minimal, official-Skeleton-aligned, modular, extensible, maintainable, and verifiable. Its storefront inventory starts from Shopify's official `skeleton-theme`; this repository adds only explicitly accepted project-owned infrastructure and capabilities, such as the lifecycle/runtime and Agent configuration. Derived themes own business features, page design, and Theme Store positioning.

## Inventory Boundary

- Shopify's current official `skeleton-theme` defines the default storefront inventory boundary.
- Theme Store requirements do not expand the mother-template inventory. Do not infer new storefront business features merely because a finished Theme Store theme would require them.

## Accepted Scope

- Project-owned additions: the component lifecycle/runtime and Agent/tooling configuration.
- Generic storefront primitives: cart page (the only built-in cart presentation), quantity selector, variant picker (buttons with swatches), buy buttons, product media gallery, pagination with section refresh, localization switcher, accordion, header nested-menu dropdown, header search entry, and product card (neutral linked image/title/price in the collection grid, with one global image-ratio setting; derived themes own card appearance).
- Action feedback stays local to the control or form that triggered it.
- Design-specific behavior (sticky or hide-on-scroll headers, sticky side panels, blog tabs, back-to-top, decorative icons) belongs to derived themes.

## Cleanup Test

Use this test when cleaning business content out of the theme. Delete down to the minimal practice, but do not delete a framework or architecture file merely because nothing uses it yet.

- Keep (the frame) when any of these holds:
  - it is listed in Accepted Scope;
  - it is a framework capability documented in a reference, for example `SectionRefresher.updateText()`, the Theme Editor event forwarding, or the `image.liquid` `position` parameter;
  - it belongs to a selected architecture direction, such as GSAP or Swiper, including its skills or adapters;
  - it is a Shopify platform requirement.
- Delete (business content): anything that serves only a specific feature of an earlier theme, such as CSS classes, events, schema settings, and locale keys left by removed features, or styles written for one old section. Example: a theme event that only a removed feature dispatched or listened to.
- List unclear items for the user; the agent does not decide them.

## Status

- The mother-template goal is met: storefront primitives, runtime, style system, validators, and Agent layer are accepted after independent review. `npm.cmd run lint`, `npm.cmd test`, and GitHub CI pass. The template stays compatible with Theme Store submission but does not implement every submission requirement.
- Theme content is the simplest use of the frame; the frame is the external layer (rules, runtime, references, validators). Sections render one `.section` frame whose settings are color scheme, padding, and the few settings official Skeleton keeps; snippets and blocks carry only behavior, state, and accessibility styling; theme JavaScript is one file per feature. Theme blocks: the Container host (`sections/custom-section.liquid`) and four blocks; composing other sections from blocks belongs to derived themes.
- `lint:theme` enforces the global settings chain for typography and color, typography tiers, stylesheet and markup placement, the motion chain, one outlet per JavaScript side effect, module registration and the import map, the copy chain, section color schemes, and vendor notices. Real exceptions carry a `lint-allow <check-id>: <reason>` comment and are listed in `docs/references/style-system/css-architecture.md`.
- Released as `v1.0.0` (tag and GitHub Release). There is no CHANGELOG; release notes live on the GitHub Release.
- Left to a theme that needs it: Shopify performance tooling that needs a store (Lighthouse CI, the benchmark store, Theme Inspector, the Web Performance Dashboard; see https://shopify.dev/docs/storefronts/themes/best-practices/performance/testing-for-performance); the gift-card recipient form, required for Theme Store submission; article JSON-LD, which official Skeleton does not emit either.
- Settled: no Playwright, because a real storefront run needs store access and the user runs browser checks, with each plan naming the pages and actions to check; no separate feature definition-of-done or design-to-code standard, because each plan's acceptance checks carry the standard; Theme Check `AssetSizeCSS` and `AssetSizeJavaScript` stay off, as in `theme-check:recommended`.
