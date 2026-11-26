# Project

## Identity

This repository, `Joey-Fjh/my-theme-2`, owns the official Shopify theme for AXIS / LAYR, an eyewear storefront centered on sculptural acetate frames, materials and fit. It started from the internal Shopify Skeleton-derived mother template and carries its shared architecture. [DESIGN.md](../DESIGN.md) is the Shopify design draft for review. The accepted external homepage prototype and its QA record are the design input.

Theme Store submission is outside the current delivery scope. The work is for the AXIS / LAYR merchant storefront.

## Inventory Boundary

The starting storefront includes the inherited header, search entry and nested menus, collection grid and product cards, product gallery and purchase controls, cart page, localization switcher, pagination and generic container and content blocks. The theme retains the Liquid module structure, Tailwind CSS v4, Alpine runtime, on-demand adapters and validation tooling.

Theme Block composition began in the mother template and continues in AXIS / LAYR. The Container section hosts the reusable `group`, `heading`, `text`, and `button` blocks, and Group supports nested children. Product and footer still use section-defined blocks. See the [Theme Block reference](references/architecture/theme-blocks.md) for current ownership and composition.

The accepted homepage prototype supplies the visual sequence for the storefront. Its demo ratings, fit controls, swatches, favorites, virtual try-on, shopping bag and newsletter feedback do not establish Shopify feature or data approvals. Each branded section or new commerce capability follows its own scope decision. Branded collection, product, cart and editorial layout work awaits design input.

## Status

- 2026-11-25. The accepted prototype guides the shared Header and homepage Hero now in the development theme. AL-5 set the 1400px page width, 16px margin and single light scheme with cobalt accents. AL-6 refined the Hero composition and homepage ruler.
- AL-5 independent static checks and the AL-6 targeted correction review passed. On 2026-11-26 the user provisionally accepted the Header and Hero. Final checks at 375, 768, 1024 and 1440 CSS px include title and focus annotation contrast over the real portrait and the configured CTA. See the [execution record](agent/context.md).
- On 2026-11-26 the user authorized AL-7 for Frame Geometry & Fit and Material & Detail, including their insertion after Hero in the homepage template. See the [execution record](agent/context.md) for scope and the [work board](agent/board.md) for the remaining shared-style discussion.
- AL-7 passed independent correction review and the nine-page live layout recheck. The user provisionally accepted both sections on 2026-11-26. Final review still needs the actual configured sections, measurements and photographs.
- On 2026-11-26 the user authorized AL-8 for a hand-picked Featured Frames grid and service strip, including insertion after Material & Detail in the homepage template. See the [execution record](agent/context.md).
- AL-8 passed independent correction review. The user provisionally accepted both sections on 2026-11-26 and authorized AL-9 to add Optician Endorsement after the service strip in the homepage template. Final AL-8 visual verification awaits configured products and approved service copy. See the [execution record](agent/context.md).
- AL-9 passed independent correction review and the user provisionally accepted Optician Endorsement on 2026-11-26. AL-10 implemented shared Footer styling. Final visual checks with approved endorsement content remain open.
- 2026-11-27. AL-14 and AL-15 passed independent review. The saved homepage defaults, Fit switching, Featured cards and Service copy have been verified within their recorded scopes. The user accepted the current review result. Combined four-width visual sign-off and authenticated Editor save/reload and real bound homepage card navigation remain open. See the [execution record](agent/context.md).
- Git starts from the imported theme at `e920623`. Release, merge, review and CI history from the mother template belongs to that project.
