---
version: alpha
name: '<derived theme — fill after design draft>'
description: Unfilled slot template for derived themes. Not a generation-gate or designmd lint target until placeholders are replaced with the approved design language.
omitted:
    - section: colors
      reason: Token values belong in the filled design draft; slots are listed under Colors below.
    - section: typography
      reason: Token values belong in the filled design draft; slots are listed under Typography below.
    - section: spacing
      reason: Token values belong in the filled design draft; slots are listed under Layout below.
    - section: rounded
      reason: Fill when the design uses radius; square corners need no rounded tokens.
    - section: components
      reason: Component tokens are optional; describe components in the body until export is needed.
---

# Design slot template

Copy this file into a derived theme and fill it following `docs/references/style-system/design-to-delivery.md`. **Do not treat this unfilled file as the mother template's brand baseline.** Mother-template code defaults (Inter, neutral schemes, square corners) remain in `config/settings_schema.json` and the token files until a derived theme maps an approved draft.

Legend: **Settings** = merchant setting in `config/settings_schema.json` (written in an authorized preset batch). **Code** = changed only in a code batch. **Derived** = computed from schemes in `snippets/css-variables.liquid` / `tailwind/tailwind.input.css`; do not set one-by-one in the draft. **B3** = the four CSS method checks are implemented; independent code review PASS (2026-11-10). B2a's container is built and accepted. B2b's typography is implemented, code-reviewed PASS and accepted within the user's confirmed mother-template architecture and completed technical-verification boundary. B2c's accent pair and shared image ratios are implemented, coordinator review PASS, user visual acceptance passed on 2026-11-10. This file remains an unfilled design template.

## Fillable draft tokens

A filled draft uses these names only. Each name maps to one existing setting or to one code-owned input. The draft writes a design role, the allowed use, and the prohibited use for every name it fills; the sentences in this table are that contract. Later tables of CSS custom properties are the runtime inventory. They do not replace this section.

Settings-backed values land in an authorized preset batch. The code inputs below keep a fixed structure. The draft may propose their values; an authorized code batch writes them. They are not new merchant settings. This unfilled file does not put brand values in those slots. Computed outputs stay computed: each spacing step, each type step, and each derived colour role. The draft does not override those outputs one by one.

Do not add free names such as `primary` or `neutral`. A scheme repeats the colour pattern with its settings id: `scheme-1-text`, not a new role.

| Draft token | Maps to | Design role | Allowed use | Do not use for |
| --- | --- | --- | --- | --- |
| `{scheme-id}-background` | `background_color` | Scheme surface | Section and component surfaces on that scheme | Text, icons, borders, another scheme's canvas |
| `{scheme-id}-background-gradient` | `background_gradient_color` | Scheme surface when a gradient is set | That scheme's background only; omit the token when the scheme is flat | Text, borders, a solid stand-in for `background` |
| `{scheme-id}-text` | `text_color` | Scheme foreground | Text, and icons that must match text, on that scheme | Borders, success or error feedback, a second brand colour |
| `{scheme-id}-border` | `border_color` | Scheme line | Borders, dividers, and input outlines on that scheme | Body copy, headings, button labels |
| `{scheme-id}-accent-background` | `accent_background_color` | Optional accent surface | Components whose approved design explicitly consumes the accent pair | Success/error feedback, an implicit change to existing buttons |
| `{scheme-id}-accent-foreground` | `accent_foreground_color` | Optional accent text | Text and icons on that scheme's accent surface | Ordinary body copy on the scheme background |
| `{scheme-id}-success-background` | `success_background_color` | Success surface | Success feedback on that scheme | Brand accent, navigation, price, primary buttons |
| `{scheme-id}-success-foreground` | `success_foreground_color` | Success text | Text and icons on the success surface | Body copy on the scheme background, error text |
| `{scheme-id}-error-background` | `error_background_color` | Error surface | Error feedback on that scheme | Sale colour, brand accent, primary buttons |
| `{scheme-id}-error-foreground` | `error_foreground_color` | Error text | Text and icons on the error surface | Body copy, success text |
| `page-canvas-scheme` | `page_canvas_color_scheme` | Which scheme paints the page canvas | The `<body>` canvas behind sections | A new colour; it chooses a scheme id |
| `heading-font` | `type_header_font` | Heading family | Headings | Body copy, a second display family outside this setting |
| `body-font` | `type_body_font` | Body family | Body copy and controls that share body type | Headings |
| `heading-weight` | `heading_weight` | Heading weight | The heading stack | A per-section weight literal |
| `heading-line-height` | `heading_line_height` | Heading line height | The heading stack | Body line height |
| `heading-letter-spacing` | `heading_letter_spacing` | Heading tracking | The heading stack | Body tracking |
| `heading-text-transform` | `heading_text_transform` | Heading case | The heading stack | Body case |
| `body-size-desktop` | `body_font_size`. In `snippets/css-variables.liquid` this is the 1280px endpoint of every `--type-step-*` (`theme_body_font_size`) | Wide endpoint of the shared fluid scale | Step 0 at 1280px. `copy-*` and `title-*` in `tailwind/tailwind.typography.css` both consume those steps. Headings also multiply by `heading-scale` | A switch at the `desktop` breakpoint (1024px). An override of one heading level |
| `body-size-mobile` | `body_font_size_mobile`. The 375px endpoint of the same steps (`theme_body_font_size_mobile`) | Narrow endpoint of the shared fluid scale | Step 0 at 375px. The same body and heading consumers | A breakpoint switch. An override of one heading level. The wide endpoint |
| `body-line-height` | `body_line_height` | Body line height | Body copy | Heading line height |
| `body-letter-spacing` | `body_letter_spacing` | Body tracking | Body copy | Heading tracking |
| `body-text-transform` | `body_text_transform` | Body case | Body copy | Heading case |
| `heading-scale` | `heading_scale` | Multiplier on heading steps | All `title-*` sizes together | A second type ratio, a single heading level only |
| `page-width` | `page_width` | Content width | The page frame | A breakpoint, a component width |
| `page-margin` | `page_margin` | Page inset | The page frame | A gap between components, section padding |
| `section-padding-top` | `padding_top` on sections that define it | Space above a section's content | That section's padding | `--spacing-section`, header or footer (they have no padding settings) |
| `section-padding-bottom` | `padding_bottom` on sections that define it | Space below a section's content | That section's padding | Content gaps, header or footer |
| `product-card-image-ratio` | `product_card_image_ratio` | Global card media ratio | Product cards | A per-card ratio, a gallery ratio |
| `spacing-base-narrow` | `--spacing-step-s` minimum in `tailwind/tailwind.input.css` (the 375px end of the one base) | Narrow spacing base | The value every spacing step multiplies at the narrow end | A separate value for one `--spacing-step-*`, section padding, a new step name |
| `spacing-base-wide` | `--spacing-step-s` maximum in the same file (the 1280px end of the one base) | Wide spacing base | The value every spacing step multiplies at the wide end | A separate value for one step, section padding, a new step name |
| `type-ratio-narrow` | The 375px ratio in `snippets/css-variables.liquid` (comment: 1.2; factors `12/10` and `10/12`) | Narrow type ratio | The ratio raised to the step index in `body-size-mobile * type-ratio-narrow ^ step`, which computes the narrow endpoint. | A value for one step, a second scale, `heading-scale` |
| `type-ratio-wide` | The 1280px ratio in the same file (comment: 1.25; factors `125/100` and `100/125`) | Wide type ratio | The ratio raised to the step index in `body-size-desktop * type-ratio-wide ^ step`, which computes the wide endpoint. | A value for one step, a second scale, `heading-scale` |
| `shadow-sm` | `--shadow-sm` in `tailwind/tailwind.input.css`, repeated per scheme in `snippets/css-variables.liquid` | Small elevation | The small shadow only | A fourth shadow, a derived colour role, a per-scheme alpha (alphas stay computed from background brightness) |
| `shadow-md` | `--shadow-md` in those two files | Mid elevation | The mid shadow only | A fourth shadow, a derived colour role, a per-scheme alpha |
| `shadow-lg` | `--shadow-lg` in those two files | High elevation | The high shadow only | A fourth shadow, a derived colour role, a per-scheme alpha |
| `motion-duration-fast` | `--motion-duration-fast` in `snippets/css-variables.liquid` | Short duration | Short feedback | A duration literal on one component, a new duration name |
| `motion-duration-base` | `--motion-duration-base` in that file | Default duration | Default motion | A duration literal on one component, a new duration name |
| `motion-duration-slow` | `--motion-duration-slow` in that file. `--motion-duration` is the same value today, not a fourth duration | Long duration | Longer motion | A separate value for `--motion-duration`, a duration literal on one component |
| `motion-ease-enter` | `--motion-ease-enter` in that file. `--motion-ease` and `--motion-ease-default` use this same curve | Enter easing | Enter and default motion | Exit motion, a curve on one component, a third easing name |
| `motion-ease-exit` | `--motion-ease-exit` in that file | Exit easing | Exits | Enter motion, a curve on one component, a third easing name |

`rounded` and `components` stay omitted until a filled draft removes that omission. A token added then is a gap unless it maps to a row above. Each `--spacing-step-*`, each `--type-step-*`, and each derived colour role is a computed output. The draft does not give those outputs their own values. `--font-body-scale` stays the constant `1` in `snippets/css-variables.liquid`; it is not one of these adjustable inputs.

## Overview

| Slot | Fill with |
| --- | --- |
| Target merchant | Who the storefront serves, catalog shape, and positioning. |
| Brand character | One short paragraph: density, warmth, motion level, and what must feel distinctive before build. |
| Submission scope | Whether Theme Store submission is in scope for this theme (yes/no); does not expand mother-template inventory by itself. |

## Colors

Schemes are defined in the `color_schemes` group. Each scheme includes:

| Slot | Setting id | Kind |
| --- | --- | --- |
| Background | `background_color` | Settings |
| Background gradient | `background_gradient_color` | Settings |
| Text | `text_color` | Settings |
| Border | `border_color` | Settings |
| Accent background / foreground | `accent_background_color`, `accent_foreground_color` | Settings (optional; no branded defaults) |
| Success background / foreground | `success_background_color`, `success_foreground_color` | Settings |
| Error background / foreground | `error_background_color`, `error_foreground_color` | Settings |
| Page canvas scheme | `page_canvas_color_scheme` | Settings (which scheme paints `<body>`) |

Derived roles are formulas on the scheme triplets. They are declared in `tailwind/tailwind.input.css` and repeated on each scheme in `snippets/css-variables.liquid` (`colour-role-sync`). Do not set them as separate merchant colours. Usage matches `docs/references/style-system/css-architecture.md` (Colour layers).

| Token | Role and usage |
| --- | --- |
| `--color-foreground` / `--color-background` / `--color-border` | Scheme text, background, and border triplets from the settings above. Body copy uses the full foreground. |
| `--color-success-background` / `--color-success-foreground` | Success feedback pair. |
| `--color-error-background` / `--color-error-foreground` | Error feedback pair. |
| `--color-muted` | Secondary text. |
| `--color-subtle` | Captions, meta, hints. |
| `--color-faint` | Graphics only (placeholder art). Not text. |
| `--color-line` / `--color-line-strong` | Dividers and edges / hover and active edges. |
| `--color-line-inverse` | Lines on an inverted fill. |
| `--color-surface-muted` / `--color-surface-strong` | Quiet fills / hover, selected, pressed, and disabled fills. |
| `--color-indicator` / `--color-indicator-strong` | State indicators and their emphasised state. |
| `--color-veil` | Translucent scheme background over media. |
| `--color-scrim` / `--color-scrim-strong` / `--color-scrim-solid` | Backdrops and image text scrims. Scrim solids are fixed black, declared once in `tailwind/tailwind.input.css`. |
| `--color-on-scrim` / `--color-on-scrim-muted` | Text and icons over a scrim. Fixed white. |
| `--color-accent-background` / `--color-accent-foreground` | Optional accent pair as RGB triplets. Each unset field falls back to the same scheme's text/background respectively. No current button consumer or Tailwind bridge. |

Alpha steps on `:root` in `snippets/css-variables.liquid`: `--alpha-5`, `--alpha-10`, `--alpha-20`, `--alpha-35`, `--alpha-50`, `--alpha-72`, `--alpha-80`. Shadow alphas rise when `color_brightness` of the scheme background is below 128.

The runtime names above are not fillable draft tokens. The filled draft uses the `{scheme-id}-*` names in Fillable draft tokens, including which scheme id `page-canvas-scheme` selects.

### Interactive and feedback states

Describe for controls, links, cards, and forms: hover, focus, active, selected, disabled, unavailable, loading, error, success, and empty. States may use Derived roles or new component CSS; gaps go to mapping, not literals in sections.

## Typography

### Font families and loaded weights

| Slot | Setting id | Kind | Notes |
| --- | --- | --- | --- |
| Heading font | `type_header_font` | Settings | Shopify `font_picker`; default face in mother template `inter_n4`. |
| Body font | `type_body_font` | Settings | Shopify `font_picker`; default `inter_n4`. |
| Loaded faces | — | Code | `snippets/css-variables.liquid` emits `font_face` for the picked body font and, when `font_modify` returns a font, body bold, italic, and bold-italic; for headings, the picked font, the `heading_weight` face, bold, italic, and bold-italic. A missing variant is skipped (`font_modify` returns nil; [font_modify](https://shopify.dev/docs/api/liquid/filters/font_modify), checked 2026-11-04). |

### Settings-backed style

| Slot | Setting id | Range or options |
| --- | --- | --- |
| Heading weight | `heading_weight` | select: 300, 400, 500, 600, 700; default 700 |
| Heading line height | `heading_line_height` | range 1–2, step 0.1, default 1.2 |
| Heading letter spacing | `heading_letter_spacing` | select: -0.05em, -0.02em, -0.01em, 0em, 0.02em, 0.05em, 0.1em; default -0.01em |
| Heading text transform | `heading_text_transform` | none, uppercase, lowercase, capitalize |
| Body size, 1280px endpoint | `body_font_size` | 16–32 px. Not a switch at the `desktop` breakpoint |
| Body size, 375px endpoint | `body_font_size_mobile` | 14–32 px. The other endpoint of the same fluid steps |
| Body line height | `body_line_height` | range 1–2, step 0.1, default 1.6 |
| Body letter spacing | `body_letter_spacing` | select: -0.05em, -0.02em, -0.01em, 0em, 0.02em, 0.05em, 0.1em; default 0em |
| Body text transform | `body_text_transform` | none, uppercase, lowercase, capitalize |
| Heading scale | `heading_scale` | min 100, max 150, unit `%`, default 100; the schema sets no `step` |

### Code-owned type structure

| Token | Role and usage |
| --- | --- |
| `--type-step--2` … `--type-step-8` | Computed in `snippets/css-variables.liquid` from `body-size-mobile`, `body-size-desktop`, `type-ratio-narrow`, and `type-ratio-wide`. Step 0 is those body-size endpoints. `copy-*` consumes a step. `title-*` consumes the same step times `heading-scale`. The steps are not fillable one by one. `html` is `font-size: 62.5%` in `assets/base.css`, so `1rem` is 10px. |
| `--font-body-scale` | Constant `1` in `snippets/css-variables.liquid`. Body utilities multiply by it. |
| `--font-heading-scale` | `heading_scale / 100`. Heading utilities multiply the step by it. |
| `copy-s` / `copy-m` / `copy-l` / `copy-xl` | `tailwind/tailwind.typography.css`. Body stack on steps −1, 0, 1, 2. Non-headings only. |
| `title-xs` through `title-4xl` | Heading stack on steps 0, 1, 2, 4, 5, 6, 7, 8 (`title-l` is step 4). Headings only. |
| `--type-step-3` and `--type-step--2` | Emitted. No `title-*` or `copy-*` utility directly selects these steps today; heading floor inputs share the step calculation. |
| Wrapped control sizes | Implemented in B2b: steps 0 and 1 (`copy-m` / `copy-l`) with text-bound padding in `em`. No separate merchant setting. |
| Display heading container cap | Implemented in B2b: element-local tier formulas in `tailwind/tailwind.typography.css` combine a settings-derived `rem` floor, viewport-fluid tier and `cqi` cap. Native and rich-text headings use the same recipes; see `docs/references/style-system/css-architecture.md` (Type scale). |
| Line height / letter spacing by tier | Implemented in B2b: code-owned per-step factors in `snippets/css-variables.liquid` derive heading rhythm from the existing settings; heading line height has a floor of 1 and Arabic-script zero tracking is retained. Body rhythm still comes from its settings. |

Fill typography tokens in front matter only in a **filled** draft, aligned with these settings and steps.

## Layout

### Page frame

| Slot | Setting id | Range | Mother-template default |
| --- | --- | --- | --- |
| Page width | `page_width` | 1000–2000 px, step 100 | 1200 |
| Page margin | `page_margin` | 10–100 px | 20 |

Plan numeric layout targets against the **container the section actually sits in**, not the viewport alone (`AGENTS.md`, Gotchas).

### Breakpoints (code)

| Name | Value | Location |
| --- | --- | --- |
| `tablet` | 48rem (768px) | `tailwind/tailwind.input.css` |
| `desktop` | 64rem (1024px) | same |
| `wide` | 80rem (1280px) | same |

Design previews and browser acceptance use **375**, **768**, **1024**, and **1440** CSS pixels.

### Section padding (settings)

Vertical padding is each section's `padding_top` and `padding_bottom` (px). It is not `--spacing-section`. Header and footer do not define these settings (`docs/project.md`). `sections/password.liquid` uses max 200; the other section schemas that define `padding_top` use min 0, max 100, step 4, default 32 (`sections/collection.liquid` and the same range on the other non-password sections that define the setting).

### Space scale (code)

`tailwind/tailwind.input.css`. One base, `--spacing-step-s`. The fillable inputs are `spacing-base-narrow` and `spacing-base-wide`. Current code is `0.6rem` to `1rem`. With `html { font-size: 62.5% }` in `assets/base.css`, that is 6px at 375px and 10px at 1280px (the file comment). The rows below are computed multiples of that base, not separate fillable values. Map a draft's gaps to a semantic name before adding a step.

| Token | × base | Role and usage |
| --- | --- | --- |
| `--spacing-step-3xs` | 0.25 | Smallest step. |
| `--spacing-step-2xs` | 0.5 | Alias `--spacing-tight`: the tightest related pair. |
| `--spacing-step-xs` | 0.75 | Between tight and the base step. |
| `--spacing-step-s` | 1 | The base. Alias `--spacing-related`: space between related items. |
| `--spacing-step-m` | 1.5 | Alias `--spacing-group`: space between groups of related items. |
| `--spacing-step-l` | 2 | Larger group gap. |
| `--spacing-step-xl` | 3 | Alias `--spacing-section`: a large content gap. Not section padding. |
| `--spacing-step-2xl` | 4 | Above the section alias. |
| `--spacing-step-3xl` | 6 | Large band. |
| `--spacing-step-4xl` | 8 | Largest step. |

Content blocks carry no outer margin; the container's gap supplies the space (`docs/references/style-system/css-method.md`, Spacing ownership). B2a's accepted Group block chooses that gap in the editor through the shared `snippets/container.liquid` implementation.

### Media ratio vocabulary

From `docs/references/style-system/image-display-contract.md`:

| Keyword | Ratio | State |
| --- | --- | --- |
| `square` | 1:1 | Built in `snippets/image.liquid` and `product_card_image_ratio` |
| `portrait` | **4:5** | Built in the same shared primitive; product galleries use this keyword |
| `landscape` | 4:3 | Built in the shared primitive and card setting; default placeholder fallback |
| `wide` | 16:9 | Built in the shared primitive and card setting |
| `adapt` | intrinsic | Built in the shared primitive; global card default |

Default fit: **cover** with focal point; **contain** on a fill for packshots.

### Layout method slots

Width modes `page` / `full`, height kinds (content-driven vs stage), container block settings, containment rule, and signature layouts are defined in `css-method.md` and `theme-blocks.md`. B2a's container is built and accepted: `blocks/group.liquid` maps its editor settings into `snippets/container.liquid`, including semantic gaps, fill/content/measure widths, containment and narrow stacking. Describe which sections use stages, grids, or signature overlap in the identity sections below. Section width modes are implemented for Container and Custom Liquid: page preserves the page inset, full sets horizontal padding to zero; coordinator review, technical browser checks and user visual acceptance passed on 2026-11-11. Stage-height settings remain unbuilt as identified in `docs/references/style-system/css-architecture.md`; the Group container does not supply section width or stage height.

## Elevation & Depth

| Token | Kind | Role and usage |
| --- | --- | --- |
| `--shadow-sm` | Code | `0 1px 3px`. Small lift. Declared in `tailwind/tailwind.input.css` and again on each scheme in `snippets/css-variables.liquid`. |
| `--shadow-md` | Code | `0 8px 24px`. Mid elevation. Same two files. |
| `--shadow-lg` | Code | `0 14px 36px`. High elevation. Same two files. |
| `--alpha-shadow-sm` / `-md` / `-lg` | Code | Per scheme in `snippets/css-variables.liquid`: 0.06 / 0.1 / 0.16 when the background brightness is 128 or above; 0.28 / 0.45 / 0.6 when it is below. |

The three values are the fillable inputs `shadow-sm`, `shadow-md`, and `shadow-lg`. The numbers in the table are the current code, not a brand value filled here. Per-scheme alphas stay computed. Omit elevation in the draft with a reason when the design is flat.

## Shapes

Radius tokens are optional. Mother template ships **square** corners (no radius token). Add `rounded` front matter and values in a filled draft when the design requires them.

## Components

Describe shared controls (buttons, fields, chips, badges) and any component-specific tokens. Mother template styles baseline button and field in `tailwind/tailwind.elements.css` without component tokens in DESIGN.md.

Cover component **states** (see Colors) and loading/error/success presentation.

## Identity — Header and navigation

| Slot | Fill with |
| --- | --- |
| Structure | Logo placement, menu depth, search/cart/locale entry, mobile drawer vs inline. When `docs/project.md` scopes Theme Store submission, state how this structure differs from the comparable Theme Store themes named in the input pack. |
| Visual | Scheme usage, sticky behavior (derived-theme feature if used), typographic tier for nav labels. |
| Container behavior | B2a provides container-based narrow stacking. A derived theme chooses and verifies its header composition. |

## Identity — Product cards

| Slot | Fill with |
| --- | --- |
| Layout | Image ratio choice (`product-card-image-ratio`), title/price stack, secondary info. When submission is in scope, state the structural difference from the comparable themes' cards. |
| Visual | Scheme, hover/focus, sold-out/unavailable. |
| Boundaries | Cards own appearance; mother template keeps a neutral linked image/title/price (`docs/project.md`). |

## Identity — Media treatment

| Slot | Fill with |
| --- | --- |
| Product / collection / editorial | Ratio keyword, cover vs contain, placeholder behavior (`snippets/image.liquid`). When submission is in scope, state the structural difference from the comparable themes' media. |
| Galleries and stages | Stage min-heights, overlay/scrim, mobile stack vs overlay (`css-method.md` height kinds; unbuilt stage slots retain the state in the current CSS bindings). |

## Identity — Page structure

| Slot | Fill with |
| --- | --- |
| Templates | Home, collection, product, cart, and key content pages referenced in previews. When submission is in scope, state the structural difference from the comparable themes' page structure. |
| Rhythm | Section padding from each section's px settings; content gaps from the space scale (`--spacing-section` is a content gap, not that padding). Full-width vs page-width bands. Signature layouts are section-owned CSS. |

## Responsive behavior

Document behavior at **375**, **768**, **1024**, and **1440** for navigation, grids, typography steps, and media. **Mobile design** is first-class, not a scaled-down desktop.

## Motion

The fillable inputs are `motion-duration-fast`, `motion-duration-base`, `motion-duration-slow`, `motion-ease-enter`, and `motion-ease-exit`. The table is the current code in `snippets/css-variables.liquid`, not a brand value filled here. `--motion-duration` matches slow. `--motion-ease` and `--motion-ease-default` match enter. Follow `docs/references/architecture/motion-architecture.md`. Describe what animates, what respects `prefers-reduced-motion`, and what stays static. Do not add a merchant setting for these values.

| Token | Value | Usage |
| --- | --- | --- |
| `--motion-duration-fast` | 250ms | Short feedback. |
| `--motion-duration-base` | 400ms | Default duration. |
| `--motion-duration-slow` / `--motion-duration` | 500ms | Longer transitions. |
| `--motion-ease` / `--motion-ease-default` / `--motion-ease-enter` | `cubic-bezier(0.22, 1, 0.36, 1)` | Enter and default. |
| `--motion-ease-exit` | `cubic-bezier(0.55, 0, 1, 0.45)` | Exit. |

## Accessibility

Focus visibility, contrast on built schemes (`npm.cmd run scan:contrast`), and no hover-only critical actions. Touch targets: state the design's intent. Checked 2026-11-04, [Increase tap target size](https://shopify.dev/docs/storefronts/themes/best-practices/performance/increase-tap-target-size): WCAG 2.2 SC 2.5.8 is 24×24 CSS px (AA); that page recommends 48×48 CSS px. This template does not add a repository minimum beyond that source.

## Do's and Don'ts

- Do map each draft value to a Settings, Code, or Derived slot before adding literals in Liquid or CSS.
- Do pass the generation gate and `designmd lint` on the **filled** file before mapping.
- Don't paste hex, px spacing, or arbitrary type into sections; `lint:theme` rejects most literals.
- Don't overwrite merchant-chosen preset values without authorized `Merchant-Change:` commits.
