# CSS Architecture Contract

This reference is the current CSS layer, token, typography, color/surface, bridge, and consumption contract. `AGENTS.md` remains the rule source.

Read this file when auditing CSS placement, typography tiers, color ownership, token sources, bridge use, or layer migrations. Image rendering rules live in `docs/references/style-system/image-display-contract.md`. Completed CSS migration history belongs in Git history. The framework-neutral method it binds is `docs/references/style-system/css-method.md` (see CSS Method bindings).

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
| `snippets/css-variables.liquid` | Merchant settings, color-scheme RGB triplets, typography, motion | Runtime CSS custom-property source |
| `tailwind/tailwind.input.css` | Tailwind `@theme inline` bridge | Only bridge values that need Tailwind utility consumption |
| Snippet/section inline custom properties | Per-render dynamic variables | Valid only when scoped to that render tree |
| `tailwind/tailwind.*.css` | CSS consumption of tokens | Prefer direct `var()` for geometry/motion internals |

## Global settings chain

Typography and color flow only through `config/settings_schema.json` → `snippets/css-variables.liquid` → tokens → tier or scheme classes. Do not bypass the chain with default Tailwind typography or palette utilities, arbitrary values (`text-[14px]`, `bg-[#fff]`), or literal typography/color properties in first-party CSS.

`tailwind/tailwind.input.css` resets Tailwind default namespaces to `initial` for font family, font size, font weight, line height, letter spacing, palette colors, easing, and animation (as breakpoints already are). Project bridges remain; keyword colors `transparent`, `current`, and `inherit` are re-declared after the color reset so utilities such as `text-current` keep working.

A typography value passes when it derives from the chain or from the inherited, already-derived value: `var(--font-*)` alone or inside `calc()` / `max()` / `min()` / `clamp()`, `inherit`, `unset`, `bolder`, `lighter`, or an `em` / `%` size. Literals such as `bold`, `600`, `1rem`, or `14px` fail, because a settings change would not reach them.

```css
/* Don't: a literal that ignores the heading weight setting */
.card__title { font-weight: 600; }

/* Do: take the value from the chain */
.card__title { font-weight: var(--font-heading-weight); }
```

`lint:theme` enforces Liquid class usage and first-party CSS (`tailwind/**/*.css`, `assets/base.css`, `assets/gift-card.css`, and `{% stylesheet %}` blocks). Regenerate `assets/tailwind.output.css` with `npm.cmd run build:tw`; do not hand-edit it.

**Accepted `lint-allow` exceptions (document every new one here):**

| Location | Check id | Reason |
| --- | --- | --- |
| `snippets/quantity-selector.liquid` (`{% stylesheet %}`) | `settings-chain-css-typography` | iOS Safari zoom floor for quantity inputs. |
| `snippets/image.liquid` (generated `image_tag` class sink) | `mixed-element` | User-approved B3 exception preserves the public `img_class` API and caller object-fit utilities on the styled `image_img` element. The reason-bearing source annotation suppresses only that sink. |
| `tailwind/tailwind.elements.css` (`.field`) | `settings-chain-css-typography` | iOS Safari zoom floor for native fields. |

## Bridge and recipe rules

Two valid chains exist:

1. **Bridge to a utility** — add a variable to `@theme inline` only when Liquid markup needs an atomic Tailwind utility (`bg-theme-bg`, `font-heading`, breakpoints, z-index layers).
2. **Recipe in a CSS layer** — typography tiers (`tailwind.typography.css`), motion capabilities (`tailwind.animates.css`), and other shared recipes consume tokens through plain CSS `var()` and `@utility` definitions in the Tailwind build. Do not bridge recipe-only tokens such as `--motion-duration-fast` or `--motion-ease-enter` into `@theme inline`.

Don't bridge motion duration or easing into `@theme`; use a recipe class instead:

```css
/* tailwind/tailwind.animates.css */
@utility spinner {
    animation: spinner-turn 0.8s linear infinite;
}
```

## Layer Ownership

| Layer/file | Owns | Does not own |
| --- | --- | --- |
| `assets/base.css` | document defaults, native elements, global `:focus-visible`, `[x-cloak]`, universal helpers | reusable component chrome |
| `tailwind.typography.css` | `title-*` and `copy-*` utilities on the type steps, plus the `heading-base` / `body-base` stacks | section-specific headings or Tailwind `text-*` heading shortcuts |
| `tailwind.elements.css` | single-element base styles for native controls | composite layouts |
| `tailwind.components.css` | reusable composite APIs with 2+ unrelated consumers | section-root scoped overrides |
| `tailwind.utilities.css` | cross-cutting placement/surface/z-index utilities | business BEM styling |
| `tailwind.animates.css` | motion capabilities, keyframes, reduced-motion rules | trigger logic |
| section/block/snippet `{% stylesheet %}` | primary home for component-owned CSS scoped to one render tree (plain CSS only) | cross-render-tree selectors, Tailwind directives, shared vocabulary |

## Promotion Thresholds

| Threshold | Meaning | Action |
| --- | --- | --- |
| 2+ unrelated consumers | CSS no longer belongs to one snippet/section family | promote to `components.css` or keep in components when adding a second consumer |
| 3+ stable repeated copies | same structural UI repeated with different BEM prefixes | consolidate into one shared component API when worthwhile |

These thresholds are complementary. A pattern can be promoted to the components layer before a full shared API consolidation is justified.

## Typography

Type utilities live in `tailwind/tailwind.typography.css`. Native heading defaults live in `assets/base.css` and use the same type steps. Liquid must not use Tailwind `text-*` utilities for headings.

The stable typography interface is `--font-body-family` and `--font-heading-family`, plus the style, weight, line-height, letter-spacing, text-transform, size and scale properties beside them, emitted from theme settings by `snippets/css-variables.liquid`. `--font-body-scale` is `1` in that file. A theme changes the size settings, or redefines the properties, and adds further roles itself.

- Semantic `h1`–`h6` level is chosen for document outline; a visual `title-*` utility is chosen independently for design size. Example: `<h3 class="title-m">` when outline needs `h3` but the visual target is a larger step.
- `title-xs`, `title-s`, `title-m`, `title-l`, `title-xl`, `title-2xl`, `title-3xl` and `title-4xl` belong on semantic heading elements (`lint:theme`, `typography-tier-heading`).
- `copy-s`, `copy-m`, `copy-l` and `copy-xl` belong on non-heading elements only (`lint:theme`, `typography-tier-body-on-heading`).
- Default body copy uses step 0 and inherits global body settings; do not add section-level body text-size settings for ordinary paragraphs.
- Native buttons, labels, legends and fields use `copy-m`; `.btn` and `.field` also set that stack explicitly. `copy-l` on the control selects the large size. Inline and heading links inherit their text role. Controls never use container units. Button padding is `0.46875em 0.9375em`, field padding `0.3125em 0.46875em`: the original 7.5/15px and 5/7.5px padding at 16px text on the 10px root, divided by 16. Button labels wrap within their available width; fields retain their native single-line editing behavior. Quantity, variant-pill and localization detail spacing also uses `em`.
- The mobile `.field` floor is `max(16px, step 0 × body scale)`; quantity inputs keep the same floor locally. Search uses the shared field floor, without an unlayered size override. `copy-l` fields take step 1, whose configured minimum mobile size is 16.8px.
- Component-owned typography exceptions may live in component/snippet CSS when part of a reusable API. If a component overrides body size, it must not imply body sliders still control it unless wired to its own scoped API.
- `.rte h1` through `.rte h6` in `tailwind/tailwind.components.css` map rich-text/merchant HTML headings and are independent from page outline semantics.

**Usage example:** a product title in a collection — semantic outline `h2`, visual step `title-xs`:

```liquid
<h2 class="title-xs">{{ product.title }}</h2>
```

Sizes come from `--type-step-0` (and the other steps) multiplied by `--font-heading-scale` or `--font-body-scale` (see the Type scale section). Display tiers cap that size by their query container. `heading-base` and `body-base` are the stacks those utilities apply. `heading-size-custom` and `body-size-custom` are the one-off escape hatches: they keep the stack and override `font-size` through a local custom property such as `--heading-size-custom`; they retain their existing mobile/desktop API rather than the display-tier cap.

## Color, Surface, And Inline Style

- Merchant color schemes produce RGB custom properties through `snippets/css-variables.liquid`.
- Each scheme includes optional `accent_background_color` and `accent_foreground_color` settings. Their source triplets are `--color-accent-background` and `--color-accent-foreground`; each unset field independently falls back to that scheme's text or background color, respectively. They have no branded schema defaults or current button consumer. The existing primary/secondary button recipes and editor role mapping stay on the foreground/background pair, and no unused Tailwind bridge is emitted.
- Those properties are comma-separated triplets (`r, g, b`). Alpha is written only in the token files, as `rgba(var(--color-foreground), var(--alpha-72))`; consumers use the roles below. The form `rgb(var(--color-foreground) / 0.55)` expands to `rgb(r, g, b / 0.55)`, which browsers reject and drop silently. `lint:theme` fails `rgb(var(--color-*) / alpha)` in `{% stylesheet %}` blocks and first-party CSS (`tailwind/**/*.css`, `assets/base.css`, `assets/gift-card.css`).
- The first configured color scheme is the `:root` token fallback; it is not the implicit visible page-canvas decision.
- `settings.page_canvas_color_scheme` explicitly owns the visible `<body>` canvas behind sections, during overscroll, and in areas without their own color-scheme scope.
- Section, overlay, and component color-scheme scopes override the body canvas normally.
- Use one surface role per node: `color-{{ section.settings.color_scheme }}` on `.section`, or `surface-component` on nested overlays such as dropdown panels. `lint:theme` (`section-color-scheme`) fails a section with a `color_scheme` setting whose root lacks the class.
- Use semantic tokens or scheme utilities for theme UI; avoid hardcoded brand colors unless documented as a platform bridge or local effect.

### Colour layers

| Layer | Lives in | Holds | Consumers |
| --- | --- | --- | --- |
| 0 source | `config/settings_schema.json` → `snippets/css-variables.liquid`; bridge tokens in `tailwind/tailwind.input.css` | Scheme roles as RGB triplets (`--color-foreground`, `--color-border`, `--color-background`, and the accent, success and error pairs); bridge tokens (`--color-theme-text`, `--color-theme-bg`, `--color-theme-border`, `--color-success`, `--color-success-text`, `--color-error`, `--color-error-text`) for utilities | CSS uses the triplets as `rgb(var(--color-*))`; the bridge tokens are utility-only (`text-theme-text`), never `var()` in CSS |
| 1 steps | `snippets/css-variables.liquid` | Abstract alpha scale on `:root`: `--alpha-5`, `-10`, `-20`, `-35`, `-50`, `-72`, `-80`; shadow steps `--alpha-shadow-sm` / `-md` / `-lg` per scheme, higher when the scheme background's `color_brightness` is below 128 | Token files only |
| 2 roles | `tailwind/tailwind.input.css` (`@theme inline`), re-declared per scheme in `snippets/css-variables.liquid` | Semantic colour and shadow tokens, each on one step. Named exceptions without a step: the fixed `--color-scrim-solid` (black) and `--color-on-scrim` (white) | Sections, snippets, layer CSS, as utilities or `var(--color-muted)` |

Tint steps are one set for every scheme: a tint's strength already follows the scheme's own foreground/background contrast. Only shadows (black) rise on dark backgrounds, where a light-scheme shadow would vanish.

**Why roles are declared twice.** A custom property whose value contains `var()` resolves on the element that declares it, and descendants inherit the result. Declared only on `:root`, `var(--color-muted)` would carry the first scheme's foreground into every section. Utilities are unaffected (`@theme inline` writes the formula into each utility), but CSS consumers need the role re-declared on every scheme scope, so the scheme loop in `css-variables.liquid` repeats each scheme-dependent role with the identical value; `lint:theme` `colour-role-sync` keeps both lists equal. Scrims and on-scrim colours are fixed, so they are declared once.

A role's colour name is the part after `--color-`. Tailwind colour utilities use that name with the prefixes in `theme-checks.config.json` (`text`, `bg`, `border`, `divide`, and the rest of `colourPrefixes`). The shadow utilities this theme allows are `shadow-sm`, `shadow-md` and `shadow-lg`.

| Role | Use |
| --- | --- |
| `--color-muted` | Secondary text. Body copy keeps the full scheme foreground |
| `--color-subtle` | Captions, meta, hints |
| `--color-faint` | Graphics only (placeholder art); never text |
| `--color-line` / `--color-line-strong` | Dividers and edges / hover and active edges |
| `--color-line-inverse` | Lines on an inverted fill; the fill itself is `rgb(var(--color-foreground))` with background-coloured content |
| `--color-surface-muted` / `--color-surface-strong` | Quiet fills / hover, selected, pressed and disabled fills |
| `--color-indicator` / `--color-indicator-strong` | State indicators and their emphasised state |
| `--color-veil` | Translucent scheme background over media |
| `--color-scrim` / `--color-scrim-strong` / `--color-scrim-solid` | Backdrops and image text scrims; fixed black |
| `--color-on-scrim` / `--color-on-scrim-muted` | Text and icons over a scrim; fixed white |
| `--shadow-sm` / `--shadow-md` / `--shadow-lg` | Elevation; the `--shadow-*` namespace is reset, so Tailwind's other shadow utilities do not exist |

**Mapping rule** for a raw value: by CSS property first (`color` → text roles; borders, outlines, dividers and 1px rules → line roles; fills on the foreground → surface roles, or indicator roles for dots and step bars; fills on the background → `veil` or `surface-muted`; black or white over media → scrim roles; decorative `box-shadow` → shadow roles), then the nearest step. A need no role covers adds a role on an existing step here, never a raw value in a consumer.

**Enforcement:** `lint:theme` `raw-colour`, `colour-role-sync`, and `colour-setting` (see `check-theme-architecture` SKILL.md). `colour-setting` rejects a `color` or `color_background` setting outside the scheme group. Its allowlist in `theme-checks.config.json` is empty.

- Allowed inline styles: scoped CSS custom properties from Liquid, platform-required media values, and per-render geometry that static utilities cannot express.
- Use semantic z-index utilities or variables for layered UI. The bridged layers are `--z-layer-dropdown`, `--z-layer-popover` and `--z-layer-skip-link`.

## Page frame

Layer order: merchant settings → `snippets/css-variables.liquid` (`--page-width`, `--page-margin`) → frame tokens on `:root` in `assets/base.css` → `.shopify-section` and `container-page`.

**Ownership.** The page frame is the only owner of page width and the one-screen height unit (`--screen-height` in `tailwind/tailwind.input.css`). Inner layers consume frame tokens; they do not recompute page insets or full viewport height.

**Tokens (`assets/base.css` `:root`).**

| Token | Value / role |
| --- | --- |
| `--page-grid-columns` | Single three-track grid with named lines `full` / `content` (`minmax(var(--page-margin), 1fr)` — `minmax(0, var(--page-width))` — tracks). |
| `--page-inset` | `max(var(--page-margin), calc((100% - var(--page-width)) / 2))` for section-local inset without reading width/margin tokens in Liquid. |

**Consumption.**

- `.shopify-section` and `container-page` set `grid-template-columns: var(--page-grid-columns)`. Direct children of `.shopify-section` default to `grid-column: content`. `.section` and `.full-width` span `full`, so the section background stays edge to edge. Page/default `.section` content uses `var(--page-inset)`; an explicit `data-section-width="full"` sets horizontal padding to zero without changing vertical padding.
- Container (`sections/custom-section.liquid`) and Custom Liquid (`sections/custom-liquid.liquid`) expose the `section_width` select. Only the literal `full` emits the full mode; missing, blank or unknown values emit page. Both modes use the same `.section[data-section-id]` frame and shared CSS in `assets/base.css`.
- The layout check's `checkPageMargin()` in `.agents/tools/layout-check/checks.mjs` exempts only content whose nearest `.section[data-section-id]` frame explicitly declares full. Page, missing, empty or unknown modes retain the gutter assertion, including a nested page frame inside full. A mode marker on a non-frame element grants no exemption. Root `--page-margin` validation and the separate overflow, text-clipping and tap-target checks still apply.
- `--screen-height` is `100svh` at the token source only.

**Rules.**

| Rule | Kind | Check |
| --- | --- | --- |
| One page-grid track list with named lines `full` / `content`, shared by `.shopify-section` and `container-page` | Enforced by structure (no lint) | One `--page-grid-columns` definition in `assets/base.css`; both consumers reference it |
| `sections/`, `snippets/` and `blocks/` never read `--page-width` / `--page-margin` (Liquid comments excepted; CSS and HTML comments fail closed); custom insets use `--page-inset` | Enforced | `page-token-scope` |
| `tailwind/tailwind.components.css` never reads `--page-width`; `--page-margin` remains the gutter token there | Enforced | `page-token-scope` |
| One-screen height is `var(--screen-height)`, not literal `100svh` / `100vh` / `100lvh` / `100dvh`, in every Liquid file (`layout/`, `sections/`, `snippets/`, `blocks/`, `templates/`) | Enforced | `screen-height-literal` |

`--page-margin` is a fluid `clamp()` from the `page_margin` setting, computed in `snippets/css-variables.liquid`. The document `min-height: 100dvh` on `body` in `assets/base.css` is the page shell, not a one-screen section height.

## Space scale

One fluid scale in `tailwind/tailwind.input.css` (`@theme inline`). Each step is a multiple of one base that runs from 6px at `100vw` = 375px to 10px at `100vw` = 1280px, written in `rem` (10px on the 62.5% root). Because the steps live in the `--spacing-step-s` namespace, every spacing utility accepts a step or alias name (this theme uses `px-step-s`, for example). Stylesheets read `var(--spacing-step-m)`.

| Step | × base | `100vw` = 375px | `100vw` = 1280px |
| --- | --- | --- | --- |
| `step-3xs` | 0.25 | 1.5px | 2.5px |
| `step-2xs` | 0.5 | 3px | 5px |
| `step-xs` | 0.75 | 4.5px | 7.5px |
| `step-s` | 1 | 6px | 10px |
| `step-m` | 1.5 | 9px | 15px |
| `step-l` | 2 | 12px | 20px |
| `step-xl` | 3 | 18px | 30px |
| `step-2xl` | 4 | 24px | 40px |
| `step-3xl` | 6 | 36px | 60px |
| `step-4xl` | 8 | 48px | 80px |

**Why `step-`.** The `step-` prefix keeps `max-w-xl` / `max-w-2xl` on `--container-*`. Keep the prefix for any new step.

**Semantic aliases** (map design intent to these first; use a step only when no alias fits):

| Alias | Step | Intent |
| --- | --- | --- |
| `tight` | `2xs` | parts of one item (icon and label, price and badge) |
| `related` | `s` | items of one group (heading and text, stacked copy) |
| `group` | `m` | groups inside a block (copy group and actions) |
| `section` | `xl` | header group to body inside a section |

**Raw-to-step mapping** (raw Tailwind unit `--spacing: 0.25rem`, 2.5px on the 62.5% root): `0.5`→`3xs`, `1`→`3xs`, `1.5`→`2xs`, `2`→`2xs`, `2.5`→`xs`, `3`→`xs`, `3.5`→`s`, `4`→`s`, `5`→`m`, `6`→`m`, `7`→`l`, `8`→`l`, `9`→`l`, `10`→`xl`, `12`→`xl`, `14`→`2xl`, `16`→`2xl`, `20`→`3xl`, `24`→`3xl`, `25`→`3xl`, `28`→`4xl`, `30`→`4xl`, `32`→`4xl`, `40`→`4xl`. Positioning offsets (`inset`, `top`, `left`, …) stay raw. Control width and height stay fixed. Steps are fluid, so a mapped value shrinks to 0.6× on mobile.

## Type scale

Eleven fluid steps in `snippets/css-variables.liquid`, keys `-2` through `8` in `type_step_keys`, emitted as `--type-step-0` for key `0` (for example `--type-step--1` and `--type-step-8`). Each step is base × ratio^n at both ends of the viewport range, with the ratio interpolating from 1.2 at `100vw` = 375px to 1.25 at 1280px (fixed in code). The mobile and desktop body size settings (`body_font_size_mobile`, `body_font_size`) are the step-0 bases. Values are `clamp()`s in `rem` on the 62.5% root. Step 3 exists on the scale but has no dedicated semantic utility yet.

**Semantic utilities** in `tailwind/tailwind.typography.css`:

| Utility | Step | Role |
| --- | --- | --- |
| `title-xs` | 0 | Heading scale × `--font-heading-scale` on `heading-base` |
| `title-s` | 1 | |
| `title-m` | 2 | |
| `title-l` | 4 | |
| `title-xl` | 5 | |
| `title-2xl` | 6 | |
| `title-3xl` | 7 | |
| `title-4xl` | 8 | |
| `copy-s` | −1 | Body scale × `--font-body-scale` on `body-base` |
| `copy-m` | 0 | |
| `copy-l` | 1 | |
| `copy-xl` | 2 | |

`heading-size-custom` and `body-size-custom` override only `font-size`, from a local variable, on the same stacks.

Native `h1`–`h6` in `assets/base.css` use steps 4, 2, 1 and 0, matching `title-l`, `title-m`, `title-s` and `title-xs`.

Display tier `n` uses `clamp(scale × floor[max(0, n − 4)], min(scale × step[n], scale × cap[n] × 1cqi), scale × step[n])`. `--font-heading-floor-n` is the sorted lower endpoint of step `n` in `rem`; `--font-heading-cap-n` is its sorted upper endpoint in `rem` divided by `0.64`. The denominator converts that endpoint to a numeric `cqi` coefficient at a 640px container on the 10px root: `high_rem × 10 / 6.4`. Thus a 640px container can reach the tier ceiling; narrower containers approach a floor indexed four steps below the tier (bounded at step 0). This is an index relationship, not a guaranteed numeric four-step reduction across unequal body-size endpoints. The settings-derived floor still grows with the user's default font size. Numeric cap inputs live at the root; the formula lives on each heading so `cqi` resolves against its actual eligible ancestor, including through a content-width container. Without an eligible ancestor, CSS container units fall back to the small viewport inline size and the same floor/ceiling remain usable. These are code-owned type choices, not container-layout changes.

Each tier's line-height factor is `1 − 0.01n`, multiplied by `--font-heading-line-height` and bounded below by `1`. At the default setting, step 8 reaches 1.104 while step 0 stays 1.2. Tracking multiplies `--font-heading-letter-spacing` by `1 + 0.05n` for nonpositive configured tracking or `1 − 0.05n` for positive tracking, tightening either sign toward larger display sizes. Zero remains zero, including the Arabic-script overrides. Native headings apply the same tier recipes in the existing base layer; rich-text headings retain their existing tier mappings in the components layer; explicit utilities remain in the utilities layer. Headings balance their lines as a progressive enhancement; body paragraphs retain pretty wrapping and ordinary wrapping remains usable.

## Breakpoints and hover

- **Breakpoints:** `--breakpoint-tablet` 48rem (768px), `--breakpoint-desktop` 64rem (1024px) and `--breakpoint-wide` 80rem (1280px), in `tailwind/tailwind.input.css`. Media query `rem` follows the user's default font size (16px), not the 62.5% root. Markup uses `tablet:`, `desktop:` and `wide:`.
- **Hover:** `can-hover` is `(hover: hover) and (pointer: fine)`; `no-hover` is its negation, `not ((hover: hover) and (pointer: fine))`.
    - They are `@custom-variant`s for classes.
    - Stylesheets write the same two conditions as media queries.
    - Touch devices do not depend on hover.
- **Liquid `{% stylesheet %}` media queries** may use only:
    - `(width >= 48rem | 64rem | 80rem)` and their `<` forms;
    - the `can-hover` pair;
    - `prefers-reduced-motion`;
    - any of these joined by `and`.
    - `lint:theme` (`stylesheet-media-query`) rejects px values, `min-width` / `max-width` spellings and other numbers. Custom properties and Tailwind's theme function do not work in media queries there.
- **`no-hover` stands alone.** CSS grammar does not allow `not (…)` to be joined by `and` without extra parentheses. To combine it with a width, nest a width query inside the `no-hover` block.
- **`@layer` inside `{% stylesheet %}`** fails `stylesheet-layer`.

## Font weights

`snippets/css-variables.liquid` loads, through `font_modify`, the body font's bold and italic faces, and the heading font's face at `heading_weight` plus bold and italic. `lint:theme` (`unloaded-font-weight`) rejects a `font-*` utility whose stem is one of `rejectedUtilities` (`thin`, `extralight`, `light`, `medium`, `semibold`, `extrabold`, `black`), and numeric `font-weight` other than `allowedNumericWeights` (`400` and `700`). The heading weight setting is the merchant control for `--font-heading-weight`; it is not a utility. The `--font-weight-*` namespace stays reset, so Tailwind's weight utilities are not part of the bridge.

## SVG Icons

- `icons/` is an ignored temporary import directory; committed optimized runtime icons live in `assets/icon-*.svg`.
- To add or replace an icon, stage its SVG in `icons/`, run `npm.cmd run build:svg`, review the asset result, and clear the staging input. Do not hand-edit optimized icon assets.
- Do not paste raw SVG into Liquid; render icons through the `icons` snippet from Liquid.

## Platform Bridge Exceptions

Shopify-rendered payment buttons are styled only through supported selectors and custom properties where the platform exposes them. The cart page element `shopify-accelerated-checkout-cart` has no theme rule and keeps Shopify's defaults.

Branded accelerated checkout buttons render in closed shadow DOM; only supported CSS custom-property bridges should be used.

## Motion Token Chain

```text
Theme setting / token source
  -> css-variables.liquid (`--motion-duration-fast`, `--motion-ease-enter`)
  -> tailwind.animates.css recipe classes (for example `.spinner`)
  -> Alpine component factories own trigger state and teardown
```

Don't use a Tailwind spin utility or `x-transition` for ordinary loading or state motion; use a motion recipe class such as `.spinner` in `tailwind/tailwind.animates.css`. Classification, first-viewport visibility, and reduced motion: `docs/references/architecture/motion-architecture.md`.

## CSS Method bindings

`docs/references/style-system/css-method.md` is the framework-neutral method; this section binds it to this repository. A rule marked **Accepted, not yet built** was accepted with the user (2026-10-30) and lands in a later batch; until then the code is as described beside it.

| Method rule | Binding here | State |
| --- | --- | --- |
| L0 page | Page frame (above): `--page-grid-columns`, `--page-inset`, `page_width` and `page_margin` settings | Built |
| L1 section padding | `.section` in `assets/base.css`; each section's `padding_top` / `padding_bottom` px range settings | Built; stays as the usual Shopify settings |
| L1 width mode `page` (default) / `full` | `section_width` on Container and Custom Liquid emits `data-section-width` on the existing section frame; shared CSS preserves page inset or sets full inset to zero | Built in these two section entry points (DL1-B5); coordinator review, technical browser checks and user visual acceptance passed on 2026-11-11. Other sections keep their existing page behavior. A `wide` page line waits for a design that needs it |
| L1 height kinds (content-driven, stage) | `--screen-height` (`100svh`) in `tailwind/tailwind.input.css`, enforced by `screen-height-literal`; no height-kind setting | Method retained; stage `min-height: clamp()` and its settings remain unbuilt. The user closed this mother-template delivery obligation on 2026-11-11; implementation requires a new scoped decision for a concrete consumer |
| Container primitive, code entry | `snippets/container.liquid`; shared shell/layout CSS in `tailwind/tailwind.components.css` | Built; actual Liquid normalization verified |
| Container primitive, editor entry | `blocks/group.liquid` captures children and maps flex/grid settings into the shared snippet; see `docs/references/architecture/theme-blocks.md` | Built; actual child capture and editor controls verified |
| Gap steps | `--spacing-tight`, `--spacing-related`, `--spacing-group`, `--spacing-section` (Space scale, above) | Built; group editor offers none, tight, related, group and section |
| Containment rule | Query shell sets inline-size containment and the name theme-container for fill and measure; flex content has no containment | Built; layout node queries the nearest named ancestor |
| Unstacked row fill basis | Shared container CSS | Built (2026-11-05). A fill-width query shell in an unstacked flex row, including a stack-on row above its threshold, uses `flex: 1 1 18rem` with `min-width: 0` and `width: auto`. `18rem` is the column floor, not a new setting or token. It is a shrinkable basis, not a minimum width. Content and measure keep their own row rules. The stacked-child rules replace this shorthand while the stack query matches. Composition fit is the boundary stated in the method |
| Container width by layout | Separate `width` (flex) and `width_grid` controls map to one snippet width parameter | Built. Flex: fill, content, measure. Grid: fill, measure. Invalid pairs normalize to fill before markup; hidden preference persistence verified |
| Units | `screen-height-literal` retains its one-screen Liquid check; `forbidden-viewport-unit` additionally rejects every statically identified vh/lvh dimension in the inputs described below | B4 implementation, validation and independent review PASS (2026-11-10). Semantic dvh/cqb and other context-dependent unit enforcement remain outside this check; existing page-shell `100dvh` and source `100svh` are unchanged. The unit method remains documented; the user closed additional enforcement as a mother-template delivery obligation on 2026-11-11. Any implementation requires a new scoped decision for a concrete consumer |
| Media ratios | `docs/references/style-system/image-display-contract.md` (Ratio vocabulary) | Built: `snippets/image.liquid` resolves square, portrait, landscape, wide and adapt; callers pass keywords |
| Wrapped text | Controls take steps 0 (standard) and 1 (large): `copy-m` and `copy-l`; native and shared control stacks isolate surrounding display type; text-bound padding and detail gaps use `em` (Typography, above) | Built |
| Display headings capped by the container | Element-local tier formulas combine the viewport scale, settings-derived `rem` floor and `cqi` cap (Type scale, above) | Built |
| Fit text | None | Accepted, not yet built (per signature component) |
| Heading wrapping | `heading-base` uses `text-wrap: balance`; `p` retains `text-wrap: pretty` | Built; wrapping enhancements degrade to ordinary wrapping |
| Line height and letter spacing by size | Settings remain the source; code-owned per-step factors tighten larger display tiers (Type scale, above) | Built |
| Colour roles | Colour layers (above) | Built. When the frame code lands, check that button primary and secondary styles derive fully from the scheme, and that the scrim behind text on images uses a colour role |
| Accent pair per scheme | Optional `accent_background_color` / `accent_foreground_color` settings emit scheme-local RGB triplets in `snippets/css-variables.liquid` | Built; unset values fall back independently to scheme text/background. Preset values and component adoption still belong to their authorized batches |
| Content has no outer margin; spacing only from tokens or relative units; `cqi` font sizes only in a `clamp()` with a `rem` floor | `content-outer-margin`, `stylesheet-spacing`, `cqi-font-floor` in `lint:theme` | Implemented in B3; independent code review PASS (2026-11-10). Tokenized checks use the declared `@csstools/css-tokenizer` development dependency and Node `>=22.12`; static coverage is below |

### CSS homes

These rules decide where a declaration lives. They complement Stylesheet Placement Constraints below.

- **Own-class elements carry project vocabulary only.** An element that carries a class its file's `{% stylesheet %}` styles may also carry project vocabulary (`@utility` names in `tailwind/*.css`, such as `title-m` or `focus-ring`). Its core Tailwind utilities move into that stylesheet as plain CSS inside `:where(.own-class)`. That selector has specificity 0: it loses to any unlayered rule with higher specificity, ties other zero-specificity rules (source order decides), and, being unlayered, still beats layered utilities (MDN, Specificity and Cascade layers). The zero-tolerance `mixed-element` check is implemented in B3 with the image sink exception listed above. R5 and the full B3 code review passed on 2026-11-10. The buy-button submit owns `position: relative` and `width: 100%` through `:where(.buy-buttons__submit)`; this unlayered ownership also takes precedence over future layered width/position utilities.
- **Anchor rule.** A rule moves into a file's `{% stylesheet %}` only when every compound of its selector, nested selectors included, is anchored on a class that file owns. Other classes in the selector may be rendered inside that file's render tree (snippets it renders), or generated there by JavaScript or a vendored library (for example Swiper). This matches Theme Check `ValidScopedCSSClass`. A rule whose subject is a shared or generated class without an owned anchor stays in the Tailwind build.

### CSS method checker coverage

The implementation starts at `.agents/skills/check-theme-architecture/scripts/lib/css-method-lint.js`, with `css-syntax.js`, `markup-sinks.js`, `cqi-font-lint.js` and `viewport-unit-lint.js` beside it; `.agents/skills/check-theme-architecture/scripts/theme-checks.config.json` enables the five checks. These are bounded static checks, not a CSS cascade engine or a Liquid renderer.

- `stylesheet-spacing` reads first-party `tailwind/**/*.css`, `assets/base.css`, `assets/gift-card.css`, and Liquid stylesheet blocks. It checks margin/padding physical and logical properties and gap/row-gap/column-gap. The tokenizer decodes escaped/scientific dimensions and traverses nested functions and var fallbacks; comments and strings are not declarations. Nonzero px/cm/mm/Q/in/pc/pt literals fail. Token references and relative units remain valid, including section px-setting tokens and component detail tokens.
- `forbidden-viewport-unit` reads the same external CSS inventory and independently projects actual Liquid style/stylesheet AST nodes, inline style attributes and generated form/image style arguments. Liquid comments/docs cannot create style inputs; raw bodies remain literal CSS, without evaluating apparent Liquid inside them. Decoded dimension tokens reject vh/lvh at any magnitude in declarations, custom properties, nested functions/fallbacks and media/supports/container/custom-media/import conditions; selector text, strings and URLs do not count. Literal Liquid branches, finite local value construction (including simple assign statements inside a liquid wrapper) and known render arguments participate. Unknown magnitude fragments inside an existing value token are re-tokenized with a numeric stand-in to expose a literal suffix, including signs/numeric/exponent fragments; unknown unit output and word-prefixed or escaped identifiers do not become dimensions. Viewport-only HTML attribute matching is case-insensitive; B3 inputs and generated Liquid argument names retain their prior handling. Attribute projections decode numeric HTML references and common punctuation references, retaining source offsets. Simple Alpine literal style strings, ternaries and noncomputed object values are inspected; calls, dynamic object keys, arbitrary runtime objects, capture-built style strings and merchant/app values are not evaluated. Projections retain the existing 128-alternative bound; general Liquid execution, HTML named-entity tables and CSS validity/cascade evaluation are outside this analysis.
- B4's class path uses the existing bounded class alternatives, with source-mapped attribute projections. The installed Tailwind compiler receives its bundled theme plus actual first-party theme, utility and custom-variant definitions. Complete candidates preserve variant conditions and bracket expressions, including `@apply`; implicit screen utilities and arbitrary values/conditions therefore expose their generated dimensions. Unknown ordinary classes and quoted selector attributes do not become unit findings. Source findings use declaration/candidate lines, or the use-site argument/attribute line for reconstructed Liquid/Alpine strings; adjacent reason-bearing suppressions retain their existing behavior. B3's original inline-style and stylesheet inputs remain separate. `viewportCssDocuments` counts CSS input projections, `viewportStyleSinks` counts nonempty projected style values and `viewportClassCandidates` counts candidate visits, including alternatives; these are not unique DOM-node counts. B4 does not enforce the semantic placement of dvh/cqb or add an exception.
- `mixed-element` relates individual HTML, Shopify form and generated image sinks to positive subject classes in that file's stylesheet. `:where()`/`:is()` and nested selectors participate; ancestor/sibling conditions and `:not()`/`:has()` do not create ownership. It follows literal classes (including Liquid if/unless/case branches), simple Alpine string/ternary/object bindings, bounded local Liquid assignment/default/append/prepend/split/strip construction and literal render arguments. Feasible alternatives retain literal truthiness and complementary simple conditions instead of inventing co-occurrence. Core candidates come from the installed Tailwind compiler; declared project `@utility` names pass. Resolution is bounded to 128 distinct string alternatives and ten Boolean condition atoms; arbitrary runtime methods, merchant/app markup and unknown class inputs are not executed.
- `content-outer-margin` classifies outer emitted content elements in each branch of blocks and snippets as reusable roots; metadata tags such as meta/title/link are excluded. Conditions and loops are transparent; Shopify forms are real parents. Group and container are explicit layout primitives; arbitrary flex/grid classes do not exempt content. Unemitted captures are not roots; directly emitted known captures and literal render class arguments are traced. Known host margin utilities, inline declarations and matching CSS subjects fail unless they are zero resets. Selector compounds match one feasible class alternative at a time. Nested descendants and core child-spacing utilities do not become host margins; host state rules such as `&:hover` still count. Component descendants, rich-text interior spacing and accordion focus compensation remain outside the root check. Caller-dependent selector ancestry, dynamic render targets and arbitrary captured/merchant HTML need review.
- `cqi-font-floor` starts at font-size declarations and follows custom-property aliases and fallbacks. Each reachable cqi path needs a containing clamp whose lower bound has a rem proof. Full selector-function and grouping-condition identity keeps the eight heading recipes scoped to their own utilities. Global CSS evidence comes from literal root-subject selectors or theme token definitions. Potential cqi tracing includes conditional media/supports definitions and overrides, including through intermediate root aliases; nearest local shadows keep unrelated root values out. Floor proof separately requires an available definition or proven positive rem fallback for the missing-definition path, and validates all potential defined replacements. A fallback cannot hide a px, zero, negative or unproven replacement. Nested fallback syntax is finite expression traversal; declaration cycles remain guarded without evaluating general CSS invalid-value behavior. A rem default cannot hide a conditional px floor. Applicable conditions travel through aliases. Conditions are compared structurally without solving exclusivity, implication or general cascade precedence; potentially overlapping definitions are handled conservatively. Settings-generated floors are proven from actual root declarations in `snippets/css-variables.liquid` and its finite literal key loop; an arbitrary variable name does not prove a floor. Bounded scalar/rem unit and sign arithmetic rejects known zero/negative floors and expressions without a positive result proof. The retained settings-derived root tokens supply positive symbolic inputs; this does not evaluate arbitrary Liquid arithmetic or merchant/runtime overrides. Unresolved aliases without a known cqi path are not a general forbidden-variable rule. General browser cascade interactions and runtime custom-property injection are not evaluated; non-font cqi is unchanged.

### CSS pitfalls

Source: [Repo], a derived theme's dropped global-scrollbar batch (2026-10-28), recorded in that theme's board history:

- A global `scrollbar-color` on `html` reads the first colour scheme (`:root`), not the page's scheme.
- A `transition` on `:where(*)` in `layer(base)` overrides Swiper's base-layer transitions.
- Changing the page gutter moves full-bleed controls positioned against it.

## Stylesheet Placement Constraints

Four constraints govern CSS written from here on. Violations of 1-3 fail silently at runtime.

1. **Plain CSS in `{% stylesheet %}`.** Shopify ships `{% stylesheet %}` content as written. `@apply`, `@utility`, and `@variant` never run there. Use plain CSS only: properties, nesting, pseudo-elements, keyframes, container queries, `:has()`, and direct `var()` consumption.

2. **Subsetting compatibility.** A file's `{% stylesheet %}` classes may be used only within that file or files it directly renders. Cross-file use breaks once CSS lives in a subsetted block. Example: `snippets/quantity-selector.liquid` defines control classes consumed by its own markup.

3. **Shared vocabulary boundary.** The Tailwind build (`tailwind/tailwind.input.css` and imported `tailwind.*.css` layers) owns shared vocabulary: design tokens bridged into `@theme inline`, typography tiers, surfaces, layout vocabulary, reusable motion capabilities, and cross-cutting utilities. Component-specific selectors with a single render-tree owner belong in that owner's `{% stylesheet %}` block. CSS that must survive when the defining file is absent from a subsetted response stays in the Tailwind build. **Growth rule:** new shared-layer entries require either (a) 2+ unrelated consumers, or (b) an explicit accepted architecture decision recorded in this reference or `AGENTS.md`.

4. **Liquid markup styling.** In Liquid markup, prefer existing Tailwind utilities and shared vocabulary classes. Component-owned CSS goes in the file's `{% stylesheet %}` block. Liquid templates never contain ad-hoc `<style>` elements.

## Bundled Asset Tag Constraints

Three Shopify platform constraints govern `{% stylesheet %}` and `{% javascript %}` tags. Violations pass local Theme Check and CLI validation but fail in the theme editor.

1. **One `{% stylesheet %}` per file.** Each `.liquid` file may contain at most one `{% stylesheet %}` block. More than one is a syntax error when editing theme code.
2. **One `{% javascript %}` per file.** Each `.liquid` file may contain at most one `{% javascript %}` block. More than one is a syntax error when editing theme code.
3. **No Liquid inside bundled asset tags.** Liquid output (`{{ }}`) and tags (`{% %}`) are not rendered inside `{% stylesheet %}` or `{% javascript %}` blocks. Including Liquid there can cause syntax errors or prevent styles from applying.

`npm.cmd run lint:theme` enforces all three. Sources: [JavaScript and stylesheet tags](https://shopify.dev/docs/storefronts/themes/best-practices/javascript-and-stylesheet-tags), [`{% stylesheet %}` tag](https://shopify.dev/docs/api/liquid/tags/stylesheet) (verified 2026-09-20).

## Decision Flow

1. Is this only a token? A value that reads a setting or a color scheme goes in `snippets/css-variables.liquid`; a code-owned scale or role that utilities consume (space steps, colour and shadow roles, breakpoints) goes in `tailwind/tailwind.input.css`; a per-render value is a scoped inline custom property.
2. Is this typography? Use `tailwind.typography.css`.
3. Is this a single control/primitive? Use `tailwind.elements.css`.
4. Is this reused by 2+ unrelated consumers? Use `tailwind.components.css`.
5. Is this owned by one section, block, or snippet render tree? Use that file's `{% stylesheet %}` block (plain CSS). Classes may be used only in that file or files it directly renders.
6. Is this cross-cutting layout/surface/z-index? Use `tailwind.utilities.css`.
7. Is this motion capability/keyframe CSS? Use `tailwind.animates.css`.
8. Must it survive subsetting when the defining Liquid file is absent? Keep it in the Tailwind build (steps 2–4, 6, or 7). Do not place it in a `{% stylesheet %}` block outside its render tree.

Never edit `vendor-*.min.css` manually. CSS source changes require `npm.cmd run build:tw`; never manually edit `assets/tailwind.output.css`.
