# Project

This file holds what is specific to this repository: its identity, inventory boundary, and accepted storefront scope. `AGENTS.md` holds the rules shared by every theme built from it. Each theme owns and rewrites this file; do not copy it when syncing the Agent layer between themes.

## Identity

This is an internal Shopify Skeleton Theme mother template for building future themes: minimal, official-Skeleton-aligned, modular, extensible, maintainable, and verifiable. Its storefront inventory starts from Shopify's official `skeleton-theme`; this repository adds only explicitly accepted project-owned infrastructure and capabilities, such as the lifecycle/runtime and Agent configuration. Derived themes own business features, page design, and Theme Store positioning.

## Inventory Boundary

- Shopify's current official `skeleton-theme` defines the default storefront inventory boundary.
- Theme Store requirements do not expand the mother-template inventory. Do not infer new storefront business features merely because a finished Theme Store theme would require them.

## Accepted Scope

- Project-owned additions: the component lifecycle/runtime and Agent/tooling configuration. Tools: the layout check and the contrast report. Vendored libraries, behind their adapters and loaded on demand: Alpine with its Intersect plugin, Swiper, and GSAP with ScrollTrigger.
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

- Stage progress (verified 2026-11-12): completed through DL1-B6 on `feat/hm1-harness`, including section width modes (DL1-B5, `1b127c4`) and the container-unit spelling correction (DL1-B6, `727f9a1`). Push and PR CI passed at `727f9a1`. PR #3 was merged into `main` on 2026-11-11 as `0e5b96b`; local `main` and `origin/main` both point to that merge commit.
- The mother-template goal is met: storefront primitives, runtime, style system, validators, and Agent layer are accepted after independent review. `npm.cmd run lint` and `npm.cmd test` pass (2026-10-14), and GitHub CI passes on `main`. The template stays compatible with Theme Store submission but does not implement every submission requirement.
- Theme content is the simplest use of the frame; the frame is the external layer (rules, runtime, references, validators). Sections render one `.section` frame whose settings are color scheme, padding (not in the header and footer), page/full width on Container and Custom Liquid, and the few settings official Skeleton keeps; snippets and blocks carry only behavior, state, and accessibility styling; theme JavaScript is one file per feature. Theme blocks: the Container host (`sections/custom-section.liquid`) and four blocks; composing other sections from blocks belongs to derived themes.
- `lint:theme` enforces the global settings chain for typography and color, typography tiers, stylesheet and markup placement, the motion chain, one outlet per JavaScript side effect, module registration and the import map, the copy chain, section color schemes, and vendor notices. Real exceptions carry a `lint-allow <check-id>: <reason>` comment and are listed in `docs/references/style-system/css-architecture.md`.
- Released as `v1.0.0` (tag and GitHub Release). There is no CHANGELOG; release notes live on the GitHub Release. `main` has moved past `v1.0.0`: pull request #1 added the CSS chain and its checks, the layout check and contrast report, the vendored libraries behind their adapters, and the design-to-delivery procedure with its baseline `DESIGN.md`. No new tag until the design procedure is first used (user, 2026-10-14).
- Agent harness (batch HM1, ported from the derived theme my-theme-1 and rewritten for this repository): client-neutral hook core in `.agents/tools/harness/` with thin Claude Code and Codex adapters; `lint:records` over the topic board, the one-line backlog and plan fields; the CI merchant-file guard (`lint:merchant`, `Merchant-Change:` trailer), which checks commits after `63a049b`.
- CSS framework contract (batch DL1-B1, 2026-10-30): the framework-neutral method `docs/references/style-system/css-method.md` and its bindings. DL1-A completed the design-procedure alignment (`41bbd1e`); DL1-B2a/B2b/B2c completed the container, typography, image-ratio and accent-pair batches. DL1-B5 implements section width on Container and Custom Liquid; coordinator review, technical browser checks and user visual acceptance passed on 2026-11-11. On 2026-11-11 the user closed stage consumers/settings and additional context-dependent unit enforcement as current mother-template delivery obligations. Their documented methods and existing infrastructure remain; the unbuilt capabilities require a new scoped decision when a concrete consumer needs them.
- Shared container (DL1-B2a, 2026-11-05): the code and Group editor entries share one flex/grid implementation with semantic gaps, width/height modes, responsive columns and container-based row stacking. Independent review and user visual acceptance passed; temporary fixtures were removed and the original homepage restored.
- Typography (DL1-B2b, 2026-11-06): settings-derived type steps feed default body copy, standard/large controls and display headings with container caps and per-tier rhythm. Implementation and independent code review passed; the user accepted this mother-template architecture batch within its completed technical-verification boundary. This records architecture acceptance, not a brand-aesthetic review. `DESIGN.md` remains the unfilled design template.
- Shared image ratios and accent pair (DL1-B2c, 2026-11-10): implemented, coordinator review PASS, user visual acceptance passed on 2026-11-10; committed as `ed75e1f`. `snippets/image.liquid` resolves square, portrait (4:5), landscape, wide and adapt; galleries use portrait and the global product-card setting includes all five. Optional scheme accent background/foreground fields emit source triplets with existing text/background fallback, without changing merchant values or current button styling.
- CSS method checks (DL1-B3, 2026-11-10): the four checks and documented image API exception completed with independent code review PASS; committed as `4dedcc6`.
- Forbidden viewport units (DL1-B4, 2026-11-10): `forbidden-viewport-unit` rejects statically identified vh/lvh uses in first-party styles and compiled Tailwind candidates. Implementation, validation and independent review PASS. Existing page-shell `100dvh` and source `100svh` remain unchanged; semantic dvh/cqb enforcement is outside this batch.
- Left to a theme that needs it: Shopify performance tooling that needs a store (Lighthouse CI, the benchmark store, Theme Inspector, the Web Performance Dashboard; see https://shopify.dev/docs/storefronts/themes/best-practices/performance/testing-for-performance); the gift-card recipient form, required for Theme Store submission; article JSON-LD, which official Skeleton does not emit either.
- Settled: the layout check uses `playwright-core`; the user still runs browser checks a plan names; no separate feature definition-of-done, because each plan's acceptance checks carry the standard; the steps from a design to settings, preset, and built sections are `docs/references/style-system/design-to-delivery.md`, and each step's acceptance checks still come from its plan; Theme Check `AssetSizeCSS` and `AssetSizeJavaScript` stay off, as in `theme-check:recommended`.
