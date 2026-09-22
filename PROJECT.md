# Project

This file holds what is specific to this repository: its identity, inventory boundary, and accepted storefront scope. `AGENTS.md` holds the rules shared by every theme built from it. Each theme owns and rewrites this file; do not copy it when syncing the Agent layer between themes.

## Identity

This is an internal Shopify Skeleton Theme mother template for building future themes: minimal, official-Skeleton-aligned, modular, extensible, maintainable, and verifiable. Its storefront inventory starts from Shopify's official `skeleton-theme`; this repository adds only explicitly accepted project-owned infrastructure and capabilities, such as the lifecycle/runtime and Agent configuration. Derived themes own business features, page design, and Theme Store positioning.

## Inventory Boundary

- Shopify's current official `skeleton-theme` defines the default storefront inventory boundary.
- Theme Store requirements do not expand the mother-template inventory. Do not infer new storefront business features merely because a finished Theme Store theme would require them.

## Accepted Scope

- Project-owned additions: the component lifecycle/runtime, native section motion, and Agent/tooling configuration.
- Generic storefront primitives: cart page (the only built-in cart presentation), quantity selector, variant picker with shared dropdown, buy buttons, product media gallery, pagination with section refresh, localization switcher, accordion, header nested-menu dropdown, header search entry, and product card (neutral linked image/title/price in the collection grid, with one global image-ratio setting; derived themes own card appearance).
- Action feedback stays local to the control or form that triggered it.
- Design-specific behavior (sticky or hide-on-scroll headers, sticky side panels, blog tabs, back-to-top, decorative icons) belongs to derived themes.
