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
- AL-5 independent static checks and the AL-6 targeted correction review passed. User visual acceptance at 375, 768, 1024 and 1440 CSS px is pending. The latest portrait preview confirmed the circular crop and spacing and identified readability issues where the title and focus annotation overlap the photo. A preview with the CTA visible is also pending. See the [execution record](agent/context.md).
- Carousel and homepage sections below the Hero remain deferred until the Header and Hero are accepted. The [work board](agent/board.md) tracks discussion of shared lines and crosshairs.
- Git starts from the imported theme at `e920623`. Release, merge, review and CI history from the mother template belongs to that project.
