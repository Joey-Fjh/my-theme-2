# CSS Architecture Contract

This reference is the current CSS layer, token, typography, color/surface, bridge, and consumption contract. `AGENTS.md` remains the rule source.

Read this file when auditing CSS placement, typography tiers, color ownership, token sources, bridge use, or layer migrations. Image rendering rules live in `docs/references/style-system/image-display-contract.md`. Completed CSS migration history belongs in Git history.

## Pipeline

```text
config/settings_schema.json + config/settings_data.json
  -> snippets/css-variables.liquid
  -> tailwind/tailwind.input.css @theme inline bridge
  -> tailwind/tailwind.*.css source layers
  -> npm.cmd run build:tw
  -> assets/tailwind.output.css (generated; never edit manually)
  -> Liquid class consumption in sections/snippets/layout
  -> npm.cmd run lint:theme architecture checks
```

Tailwind scans every token in the `@source` Liquid files, including `{% schema %}` JSON and `t:` locale-key paths. A key segment that matches a utility name, such as `presets.container`, emits that utility into the generated stylesheet. Name schema and locale keys so their segments are not utility names, and check the generated diff after a rebuild.

## Token Sources

| Source | Owns | Notes |
| --- | --- | --- |
| `snippets/css-variables.liquid` | Merchant settings, color-scheme RGB triplets, typography, motion, button/input geometry | Runtime CSS custom-property source |
| `tailwind/tailwind.input.css` | Tailwind `@theme inline` bridge | Only bridge values that need Tailwind utility consumption |
| Snippet/section inline custom properties | Per-render dynamic variables | Valid only when scoped to that render tree |
| `tailwind/tailwind.*.css` | CSS consumption of tokens | Prefer direct `var()` for geometry/motion internals |

## Bridge Rules

Bridge a CSS variable into `@theme inline` only when Liquid markup needs a Tailwind utility such as `bg-*`, `text-*`, spacing, breakpoint, or z-index utility.

Do not bridge variables that are only consumed inside CSS layer rules. Examples that intentionally stay direct `var()` consumption:

- `--button-*`, `--input-*`, `--toast-*`
- `--motion-duration-*`, `--motion-ease-*`
- `--focus-ring-*`
- snippet-local variables such as `--pagination-*`

## Layer Ownership

| Layer/file | Owns | Does not own |
| --- | --- | --- |
| `assets/base.css` | document defaults, native elements, `[x-cloak]`, universal helpers | reusable component chrome |
| `tailwind.typography.css` | project typography tiers and custom size tiers | section-specific headings or Tailwind `text-*` heading shortcuts |
| `tailwind.elements.css` | single-element primitives: `btn`, `field`, `badge`, links, icons, close button, focus ring | composite layouts |
| `tailwind.components.css` | reusable composite APIs with 2+ unrelated consumers | section-root scoped overrides |
| `tailwind.snippets.css` | retired import stub only (no class rules) | new component CSS; do not add selectors here |
| `tailwind.utilities.css` | cross-cutting placement/surface/z-index utilities | business BEM styling |
| `tailwind.animates.css` | motion capabilities, reveal states, keyframes, reduced-motion kill switches | trigger logic |
| section/block/snippet `{% stylesheet %}` | primary home for component-owned CSS scoped to one render tree (plain CSS only) | cross-render-tree selectors, Tailwind directives, shared vocabulary |

## Promotion Thresholds

| Threshold | Meaning | Action |
| --- | --- | --- |
| 2+ unrelated consumers | CSS no longer belongs to one snippet/section family | promote to `components.css` or keep in components when adding a second consumer |
| 3+ stable repeated copies | same structural UI repeated with different BEM prefixes | consolidate into one shared component API when worthwhile |

These thresholds are complementary. A pattern can be promoted to the components layer before a full shared API consolidation is justified.

## Typography

Typography tier CSS lives in `tailwind/tailwind.typography.css`. Native heading defaults live in `assets/base.css`. Liquid must not use Tailwind `text-*` utilities for headings.

The Skeleton's stable typography interface is `--font-body-*` and `--font-heading-*`, emitted from theme settings by `snippets/css-variables.liquid`. Derived themes change the values through settings or by redefining the properties, and add further roles (such as a subtitle or eyebrow style) themselves.

- Semantic `h1`–`h6` level is chosen for document outline; visual `heading-h*` tier is chosen independently for design size. Example: `<h3 class="heading-h2">` when outline needs `h3` but the visual target is a larger tier.
- `heading-h*` classes remain restricted to semantic heading elements; lint bans them on non-heading elements only.
- Display tiers such as `heading-4xl` through `heading-xl` remain valid where intended. Section subtitles use a `body-*` size tier alone and inherit body font settings.
- `body-*` tiers are for non-heading body semantics only; do not put them on headings.
- Default body copy inherits global body settings; do not add section-level body text-size settings for ordinary paragraphs.
- `heading-size-custom` and `body-size-custom` require their scoped CSS variables.
- Component-owned typography exceptions may live in component/snippet CSS when part of a reusable API. If a component overrides body size, it must not imply body sliders still control it unless wired to its own scoped API.
- `.rte h1` through `.rte h6` map rich-text/merchant HTML headings and are independent from page outline semantics.

Exact tier ratios, token math, and lint exceptions live in source and `lint:theme`.

## Color, Surface, And Inline Style

- Merchant color schemes produce RGB custom properties through `snippets/css-variables.liquid`.
- Those properties are comma-separated triplets (`r, g, b`). Write alpha as `rgba(var(--color-foreground), 0.55)`. The form `rgb(var(--color-foreground) / 0.55)` expands to `rgb(r, g, b / 0.55)`, which browsers reject and drop silently. `lint:theme` fails `rgb(var(--color-*) / alpha)` in `{% stylesheet %}` blocks and first-party CSS (`tailwind/**/*.css`, `assets/*.css`).
- The first configured color scheme is the `:root` token fallback; it is not the implicit visible page-canvas decision.
- `settings.page_canvas_color_scheme` explicitly owns the visible `<body>` canvas behind sections, during overscroll, and in areas without their own color-scheme scope.
- Section, overlay, drawer, modal, and component color-scheme scopes override the body canvas normally.
- Use one surface role per node: `color-{{ section.settings.color_scheme }}`, `surface-section`, `surface-component`, `surface-inverted`, or local opacity effects.
- Use semantic tokens or scheme utilities for theme UI; avoid hardcoded brand colors unless documented as a platform bridge or local effect.
- Allowed inline styles: scoped CSS custom properties from Liquid, platform-required media values, and per-render geometry that static utilities cannot express.
- Use semantic z-index utilities or variables for layered UI.

## SVG Icons

- `icons/` is an ignored temporary import directory; committed optimized runtime icons live in `assets/icon-*.svg`.
- To add or replace an icon, stage its SVG in `icons/`, run `npm.cmd run build:svg`, review the asset result, and clear the staging input. Do not hand-edit optimized icon assets.
- Do not paste raw SVG into Liquid; render icons through the `icons` snippet from Liquid.

## Platform Bridge Exceptions

The following platform selectors may live in `elements.css` because they bridge Shopify-controlled markup into the theme button system:

- `button.shopify-payment-button__button--unbranded`
- `shopify-accelerated-checkout`
- `shopify-accelerated-checkout-cart`
- Shopify payment button wrappers needed for width/layout

Branded accelerated checkout buttons render in closed shadow DOM; only supported CSS custom-property bridges should be used.

## Motion Token Chain

```text
Theme setting / token source
  -> css-variables.liquid (`--motion-duration-*`, `--motion-ease-*`)
  -> CSS consumers through direct `var()` usage
  -> tailwind.animates.css owns reveal/keyframe capabilities
  -> Alpine component factories registered through the adapter own trigger state and teardown
```

Rules:

- Do not restore `snippets/motion-transition.liquid`.
- Do not scatter `x-transition:*` recipes for ordinary state motion.
- Do not hide critical first-viewport content behind animation completion.
- Use `docs/references/architecture/motion-architecture.md` for motion classification.

## Stylesheet Placement Constraints

Four constraints govern CSS written from here on. Violations of 1-3 fail silently at runtime.

1. **Plain CSS in `{% stylesheet %}`.** Shopify ships `{% stylesheet %}` content as written. `@apply`, `@utility`, and `@variant` never run there. Use plain CSS only: properties, nesting, pseudo-elements, keyframes, container queries, `:has()`, and direct `var()` consumption.

2. **Subsetting compatibility.** A file's `{% stylesheet %}` classes may be used only within that file or files it directly renders. Cross-file use breaks once CSS lives in a subsetted block. Example: `sections/header.liquid` defines header layout classes consumed only by header markup and snippets the header renders.

3. **Shared vocabulary boundary.** The Tailwind build (`tailwind/tailwind.input.css` and imported `tailwind.*.css` layers) owns shared vocabulary: design tokens bridged into `@theme inline`, typography tiers, surfaces, layout vocabulary, reusable motion capabilities, and cross-cutting utilities. Component-specific selectors with a single render-tree owner belong in that owner's `{% stylesheet %}` block. CSS that must survive when the defining file is absent from a subsetted response stays in the Tailwind build. **Growth rule:** new shared-layer entries require either (a) 2+ unrelated consumers, or (b) an explicit accepted architecture decision recorded in this reference or `AGENTS.md`. `tailwind.snippets.css` is retired; do not add new selectors there.

4. **Liquid markup styling.** In Liquid markup, prefer existing Tailwind utilities and shared vocabulary classes. Component-owned CSS goes in the file's `{% stylesheet %}` block. Liquid templates never contain ad-hoc `<style>` elements.

## Bundled Asset Tag Constraints

Three Shopify platform constraints govern `{% stylesheet %}` and `{% javascript %}` tags. Violations pass local Theme Check and CLI validation but fail in the theme editor.

1. **One `{% stylesheet %}` per file.** Each `.liquid` file may contain at most one `{% stylesheet %}` block. More than one is a syntax error when editing theme code.
2. **One `{% javascript %}` per file.** Each `.liquid` file may contain at most one `{% javascript %}` block. More than one is a syntax error when editing theme code.
3. **No Liquid inside bundled asset tags.** Liquid output (`{{ }}`) and tags (`{% %}`) are not rendered inside `{% stylesheet %}` or `{% javascript %}` blocks. Including Liquid there can cause syntax errors or prevent styles from applying.

`npm.cmd run lint:theme` enforces all three. Sources: [JavaScript and stylesheet tags](https://shopify.dev/docs/storefronts/themes/best-practices/javascript-and-stylesheet-tags), [`{% stylesheet %}` tag](https://shopify.dev/docs/api/liquid/tags/stylesheet) (verified 2026-09-20).

## Decision Flow

1. Is this only a token? Use `css-variables.liquid` or scoped inline custom properties.
2. Is this typography? Use `tailwind.typography.css`.
3. Is this a single control/primitive? Use `tailwind.elements.css`.
4. Is this reused by 2+ unrelated consumers? Use `tailwind.components.css`.
5. Is this owned by one section, block, or snippet render tree? Use that file's `{% stylesheet %}` block (plain CSS). Classes may be used only in that file or files it directly renders.
6. Is this cross-cutting layout/surface/z-index? Use `tailwind.utilities.css`.
7. Is this motion capability/reveal/keyframe CSS? Use `tailwind.animates.css`.
8. Must it survive subsetting when the defining Liquid file is absent? Keep it in the Tailwind build (steps 2–4, 6, or 7). Do not place it in a `{% stylesheet %}` block outside its render tree.

## Governance

- `npm.cmd run lint:theme` enforces protected Liquid runtime-name assign/capture, bundled-asset tag limits and no-Liquid-in-block rules, static `role="tab"` accessibility, and the SVG `<text textLength>` nested `<tspan>` guard.
- Never edit `vendor-*.min.css` manually.
- CSS source changes require `npm.cmd run build:tw`; never manually edit `assets/tailwind.output.css`.
- Record durable architecture decisions in the relevant reference, not in `context.md` unless it is short cross-session state.
- Keep optional cleanup ideas out of this contract until repository evidence makes them actionable.
