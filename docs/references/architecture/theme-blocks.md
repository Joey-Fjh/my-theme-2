# Theme Block Reference

This reference owns the Theme Block contracts: the initial block inventory, the Container host, blank-content and editor-placeholder behavior, and the generic-block responsibility boundary. `AGENTS.md` remains the rule source. Read this file when adding or changing Theme Blocks, their schemas, allowed parents, or blank-content handling in the four theme blocks.

Inspect current source for exact settings, schema shape, and markup.

## Scope and non-scope

**In scope:**

- The four Theme Blocks: `group`, `heading`, `text`, `button`
- The Container host section (`sections/custom-section.liquid`)
- Blank-content rule and which blocks currently implement it
- Generic-block responsibility boundary

**Out of scope (owned elsewhere or deferred):**

- Liquid `{% block %}` / `{% partial %}` — not baseline dependencies; adoption requires explicit approval (`javascript-runtime.md`, Liquid Rendering Features)
- `SectionRefresher` — transitional label only; still the required section-refresh mechanism today (`javascript-runtime.md`, Transitional status)
- New block types, schemas, and allowed parents beyond the four blocks below
- Composing other sections from theme blocks and adding block types: the organization follows Horizon (sections composed from theme blocks, static blocks for fixed parts), but the template ships only the Container host and the four blocks; derived themes extend both
- Media behavior, including a Container `background_image` setting — deferred; see `../style-system/image-display-contract.md`
- Global page, Section, and Block layout protocol — see `../style-system/css-method.md` and its bindings in `../style-system/css-architecture.md` (CSS Method bindings)
- Whether to extend a shared abstraction — see `abstraction-boundaries.md`
- Heading semantic level versus visual tier, and `body-*` / `heading-*` tier rules — see `../style-system/css-architecture.md`
- `image` block type — deferred to the media contract; do not migrate `snippets/image.liquid` or turn preview-only Liquid features into undeclared stable requirements

## Host (Container)

`sections/custom-section.liquid` is the host for the four Theme Blocks. In the Theme Editor it appears as **Container** (`t:sections.custom-section.name` / preset name in `locales/en.default.schema.json`).

The section:

- Renders a color-scheme surface with configurable vertical padding
- Offers `section_width`: page (default) preserves the page inset; full sets horizontal padding to zero. Only explicit full emits `data-section-width="full"` on the existing frame; other values normalize to page. Shared CSS in `assets/base.css` owns the inset. This is the section's width, independent of a Group block's fill/content/measure sizing.
- Outputs `{% content_for 'blocks' %}` inside the section frame (`.section color-{{ section.settings.color_scheme }}`)
- Accepts `@theme` blocks only in its schema (`"blocks": [{ "type": "@theme" }]`)

`group` is the only block that nests children. Its schema accepts `@theme` and `@app` block types and renders them via `{% content_for 'blocks' %}` inside the shared container layout node.

## Block inventory and responsibilities

| Block | File | Responsibility |
| --- | --- | --- |
| `group` | `blocks/group.liquid` | Child composition. Flex/grid container settings mapped into `snippets/container.liquid`; captures nested blocks through `{% content_for 'blocks' %}`. |
| `heading` | `blocks/heading.liquid` | Heading text. Settings: the heading text (`heading`) and the semantic level (`semantic_level` → `h1`–`h6` tag). There is no size setting; the visual step is fixed at `title-m`. See `../style-system/css-architecture.md` for the type scale. |
| `text` | `blocks/text.liquid` | Non-heading rich text. Renders `block.settings.text` with the fixed `copy-m` step; there is no size setting. |
| `button` | `blocks/button.liquid` | Navigation-style call to action. Renders a link when both `label` and `link` are present. |

## Container block

Implemented through `blocks/group.liquid` and `snippets/container.liquid`, with the shared CSS in `tailwind/tailwind.components.css`. The block captures children and maps editor values; the snippet owns one `.theme-block-query` shell and one `.theme-block-group` layout node. Only the shell carries `block.shopify_attributes`. Actual child capture, conditional controls and shell-only editor attributes were verified in DL1-B2a.

- **One nestable container block** carries the method's container interface. It covers grids, splits, groups and stacks. Rails stay a separate component because they carry behaviour (Swiper).
- **Settings**, each a short enumeration on tokens:
    - layout (flex / grid);
    - direction, distribution and stack-when-narrow (flex);
    - columns, auto or 1–6 as a maximum (grid);
    - alignment;
    - gap from the semantic steps, using none, tight, related, group and section;
    - width: flex is fill, content, or measure; grid is fill or measure. Content is not a grid value. The user accepted that split on 2026-11-04. Separate `width` and `width_grid` controls preserve each layout preference.
    - height (content / fill parent).
- **Conditional settings.** Settings that do not apply to the chosen layout are hidden with `visible_if`. Shopify's settings page documents it as "Settings can be displayed conditionally by passing a boolean expression to the visible_if attribute", with the example `"visible_if": "{{ block.settings.layout_style == 'flex' }}"` (https://shopify.dev/docs/storefronts/themes/architecture/settings; changelog 2025-05-21).
- **Boundary:** layout only, with no background, padding, border, radius or shadow. Content and components own their look; the container owns the gap between children, and children carry no outer margin.
- **Defaults and normalization:** flex, column, start distribution, stretch alignment, auto columns, related gap, fill width and content height. Stored `row-stack` maps to row plus stack on; grid forces column and stack off. Omitted, blank or unknown layout becomes flex; invalid width becomes fill, including grid plus content. The five normalization cases were verified through actual Shopify Section Rendering API output.
- **Sizing:** content flex keeps intrinsic width without containment. Measure is capped at `min(65ch, 100%)`. Height fill transfers free block space into the layout node and does not shrink below content. Stack thresholds use two 18rem floors plus the semantic gap ceiling; maximum grid columns use capped auto-fit tracks.
- **Containment:** the method's containment rule. Fill and measure widths set `container-type: inline-size`. Content width is flex only and does not.
- **Unstacked row fill:** a fill-width query shell in an unstacked flex row uses `flex: 1 1 18rem`, `min-width: 0` and `width: auto`. `18rem` is the same length as the column floor. It is the flex basis the item shrinks from, not a minimum width, and it is not a new setting or token. Content and measure keep their own row rules. A stack-on row keeps this shorthand above its existing threshold. While the stack query matches, the stacked child rules replace it. A used width above zero does not mean the contents fit. Check the actual text, controls, sibling count and gap at the narrowest parent that composition sits in. A composition that does not fit uses stack-on or another arrangement, and that result is checked too. The two-column stack threshold does not protect an arbitrary stack-off composition. This acceptance adds no wrap, scroll, clip, hidden overflow, new minimum width, or silent stack change.
- **Depth:** a section composed of blocks usually needs one container with content inside: three levels counting the section. Shopify allows "8 levels, excluding the section level" (https://shopify.dev/docs/storefronts/themes/architecture/limits), and the Theme Store requirements ask to "Avoid unnecessarily deep nesting of blocks or complicated configuration structures" (https://shopify.dev/docs/storefronts/themes/store/requirements). Nest a further container only when the design needs it.
- **Uneven distances** inside a group are a nested container, not spacing settings on `heading`, `text` or `button`.

## Blank-content rule and current coverage

**Rule:** A Theme Block whose required content is blank renders nothing in the storefront. Only in the editor (`request.design_mode`) it renders a non-semantic placeholder that carries `block.shopify_attributes`, so the block stays selectable.

**Current coverage:**

| Block | Blank branch | Storefront when blank | Editor when blank |
| --- | --- | --- | --- |
| `heading` | Yes | Renders nothing | Placeholder `<div>` with `blocks.heading.placeholders.empty` locale key |
| `button` | Yes | Renders nothing (when `label` or `link` is blank) | Placeholder `<div>` with `blocks.button.placeholders.empty` locale key |
| `text` | No | Always renders the `copy-m` wrapper, including when `text` is empty | Same as storefront |
| `group` | No | Always renders the flex wrapper, including when it has no child blocks | Same as storefront |

Do not assume all four blocks implement the blank-content rule. Extending the rule to `text` or `group` is a separate decision.

## Generic-block boundary

A generic block may vary appearance while preserving semantics, but must not collect unrelated ownership, business semantics, or behavior modes merely to reuse markup.

Before adding settings or branches that mix concerns, apply the three-question gate in `abstraction-boundaries.md`. If the gate triggers, split into a dedicated block or defer the feature.
