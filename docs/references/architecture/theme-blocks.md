# Theme Block Reference

This reference owns the Theme Block contracts: the initial block inventory, the Container host, blank-content and editor-placeholder behavior, and the generic-block responsibility boundary. `AGENTS.md` remains the rule source. Read this file when adding or changing Theme Blocks, their schemas, allowed parents, or blank-content handling in the four theme blocks.

Inspect current source for exact settings, schema shape, and markup.

## Scope and non-scope

**In scope:**

- The four Theme Blocks: `group`, `heading`, `text`, `button`
- The Container host section (`sections/custom-section.liquid`)
- Blank-content rule and which blocks currently implement it
- Generic-block responsibility boundary

**Out of scope (still undecided or owned elsewhere):**

- Liquid `{% block %}` / `{% partial %}` adoption stance — see `javascript-runtime.md` (Liquid Rendering Features)
- `SectionRefresher` transitional status — see `javascript-runtime.md` (Transitional status)
- New block types, schemas, and allowed parents beyond the four blocks below
- Media behavior, including a Container `background_image` setting — deferred; see `../style-system/image-display-contract.md`
- Global page, Section, and Block layout protocol
- Whether to extend a shared abstraction — see `abstraction-boundaries.md`
- Heading semantic level versus visual tier, and `body-*` / `heading-*` tier rules — see `../style-system/css-architecture.md`
- `image` block type — deferred to the media contract; do not migrate `snippets/image.liquid` or turn preview-only Liquid features into undeclared stable requirements

## Host (Container)

`sections/custom-section.liquid` is the host for the four Theme Blocks. In the Theme Editor it appears as **Container** (`t:sections.custom-section.name` / preset name in `locales/en.default.schema.json`).

The section:

- Renders a color-scheme surface with configurable vertical padding
- Outputs `{% content_for 'blocks' %}` inside a `layout container-page` wrapper
- Accepts `@theme` blocks only in its schema (`"blocks": [{ "type": "@theme" }]`)

`group` is the only block that nests children. Its schema accepts `@theme` and `@app` block types and renders them via `{% content_for 'blocks' %}` inside a flex container.

## Block inventory and responsibilities

| Block | File | Responsibility |
| --- | --- | --- |
| `group` | `blocks/group.liquid` | Child composition. Flex direction, alignment, and gap settings; renders nested blocks through `{% content_for 'blocks' %}`. |
| `heading` | `blocks/heading.liquid` | Heading text. Settings: the heading text (`heading`) and the semantic level (`semantic_level` → `h1`–`h6` tag). There is no size setting; the visual tier is fixed at `heading-h2`. See `../style-system/css-architecture.md` for tier rules. |
| `text` | `blocks/text.liquid` | Non-heading rich text. Renders `block.settings.text` inside a `theme-block-text` wrapper with the fixed `body-base` tier; there is no size setting. |
| `button` | `blocks/button.liquid` | Navigation-style call to action. Renders a link (`<a>`) when both `label` and `link` are present; primary or secondary style via `btn-primary` / `btn-secondary`. |

## Blank-content rule and current coverage

**Rule:** A Theme Block whose required content is blank renders nothing in the storefront. Only in the editor (`request.design_mode`) it renders a non-semantic placeholder that carries `block.shopify_attributes`, so the block stays selectable.

**Current coverage:**

| Block | Blank branch | Storefront when blank | Editor when blank |
| --- | --- | --- | --- |
| `heading` | Yes | Renders nothing | Placeholder `<div>` with `blocks.heading.placeholders.empty` locale key |
| `button` | Yes | Renders nothing (when `label` or `link` is blank) | Placeholder `<div>` with `blocks.button.placeholders.empty` locale key |
| `text` | No | Always renders the `theme-block-text` wrapper, including when `text` is empty | Same as storefront |
| `group` | No | Always renders the flex wrapper, including when it has no child blocks | Same as storefront |

Do not assume all four blocks implement the blank-content rule. Extending the rule to `text` or `group` is a separate decision.

## Generic-block boundary

A generic block may vary appearance while preserving semantics, but must not collect unrelated ownership, business semantics, or behavior modes merely to reuse markup.

Before adding settings or branches that mix concerns, apply the three-question gate in `abstraction-boundaries.md`. If the gate triggers, split into a dedicated block or defer the feature.
