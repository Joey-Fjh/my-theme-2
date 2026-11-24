---
version: alpha
name: AXIS / LAYR
description: Shopify design draft for sculptural acetate eyewear, based on the accepted homepage prototype.
omitted:
    - section: rounded
      reason: Rectangular controls and panels are square. The circular Hero crop and rounded editorial panel are component shapes.
    - section: components
      reason: Component treatments are described in the text until Shopify mapping is approved.
colors:
    scheme-2-background: '#FCFCFC'
    scheme-2-text: '#111214'
    scheme-2-border: '#111214'
    scheme-2-accent-background: '#2320ED'
    scheme-2-accent-foreground: '#FCFCFC'
    scheme-2-success-background: '#ECFDF5'
    scheme-2-success-foreground: '#065F46'
    scheme-2-error-background: '#FEF2F2'
    scheme-2-error-foreground: '#991B1B'
typography:
    heading-font:
        fontFamily: Inter
    heading-weight:
        fontWeight: 700
    heading-line-height:
        lineHeight: 1.1
    heading-letter-spacing:
        letterSpacing: -0.05em
    body-font:
        fontFamily: Arial
    body-size-mobile:
        fontSize: 14px
    body-size-desktop:
        fontSize: 16px
    body-line-height:
        lineHeight: 1.4
    body-letter-spacing:
        letterSpacing: 0em
spacing:
    page-width: 1400px
    page-margin: 16px
    section-padding-top: 32px
    section-padding-bottom: 32px
    spacing-base-narrow: 6px
    spacing-base-wide: 10px
---

# AXIS / LAYR

## Overview

AXIS / LAYR is an eyewear storefront focused on angular acetate frames, sculptural profiles and precision of fit. The homepage reads like a technical sheet with editorial photography. Fine panel lines organize the page, oversized italic title lines frame the portrait, and small monospaced notes identify details. Cobalt marks selected or actionable elements and traces two short arcs around the Hero portrait.

This Shopify draft is for review. It draws on the accepted AXIS / LAYR homepage, using the implementation side of the desktop comparison, the mobile and tablet previews, and the static prototype QA record. The prototype supplies homepage design evidence. The current delivery scope is the merchant storefront, with Theme Store submission outside this draft.

## Colors

The page canvas inherits the first configured scheme. `scheme-2` is the current light scheme and is also the Hero default. A gradient scheme and a second brand palette are deferred.

| Draft tokens | Settings and visual role | Application |
| --- | --- | --- |
| `scheme-2-background`, `scheme-2-text` | `background_color`, `text_color`. Paper and ink from the prototype. | Paper on the page and section surfaces. Ink for text and matching icons. |
| `scheme-2-border` | `border_color`. Ink for the CTA outline and meaningful control boundaries. | Reserve the full-strength line for functional edges. Derive quiet panel rules from the scheme. The prototype's light grey rules are visual references for decorative lines. |
| `scheme-2-accent-background`, `scheme-2-accent-foreground` | `accent_background_color`, `accent_foreground_color`. Cobalt with paper on filled accent states. | Cobalt focus, links and selected details on paper. Paper labels on cobalt fills. Keep the Hero CTA in ink and paper. The ring uses cobalt as decoration. |
| `scheme-2-success-background`, `scheme-2-success-foreground` | `success_background_color`, `success_foreground_color`. Existing feedback pair proposed for reuse. | Success messages on transactional controls and forms. |
| `scheme-2-error-background`, `scheme-2-error-foreground` | `error_background_color`, `error_foreground_color`. Existing feedback pair proposed for reuse. | Error messages on transactional controls and forms. |
| `page-canvas-scheme` | First configured scheme in `color_schemes`, currently `scheme-2`. | Page canvas behind sections. |

The portrait ring may pick up a softer line tint from the adjacent photography. The quote panel's soft violet lighting belongs to its editorial treatment. Derived text, surface and border roles continue to come from the theme scheme.

## Typography

| Draft tokens | Settings and visual role | Application |
| --- | --- | --- |
| `heading-font`, `heading-weight`, `heading-line-height`, `heading-letter-spacing` | `type_header_font`, `heading_weight`, `heading_line_height`, `heading_letter_spacing`. Inter, 700, 1.1 and −0.05em are proposed starting points. | Use the existing heading tiers and their per-tier rhythm. The Hero pairs a strong slanted wordmark line with light italic descriptor lines. |
| `heading-text-transform` | `heading_text_transform`. Proposed `none`. | Author the AXIS / LAYR wordmark and English display text in their intended case. Localized headings may wrap and retain language-appropriate casing. |
| `body-font`, `body-line-height`, `body-letter-spacing`, `body-text-transform` | `type_body_font`, `body_line_height`, `body_letter_spacing`, `body_text_transform`. Arial-style system sans, 1.4, 0em and `none`. | Keep body copy, nav labels and control labels legible. Apply uppercase to short English CTA and engineering labels in their own roles. |
| `body-size-mobile`, `body-size-desktop`, `heading-scale` | `body_font_size_mobile`, `body_font_size`, `heading_scale`. Proposed 14px at 375px and 16px at 1280px with a 100% heading multiplier. | These are the shared type-scale inputs. Titles and copy fluidly follow their existing tiers, and controls use the standard or large wrapped control sizes. |
| `type-ratio-narrow`, `type-ratio-wide` | Existing code inputs 1.2 and 1.25. | Keep the computed type steps and the `rem` floor on headings whose upper size follows their container. |

The prototype uses Arial Bold Italic for the wordmark treatment, Inter 300 Italic for the descriptor and Courier New for short technical notes. During mapping, verify the Shopify font choices and real italic face availability. Inter 300 Italic, the wordmark face and the localized mono label treatment are component needs to resolve before preset or Hero implementation. Keep the fewest loaded faces needed to preserve the visual hierarchy.

## Layout

| Draft tokens | Settings or code input | Application |
| --- | --- | --- |
| `page-width`, `page-margin` | `page_width` and `page_margin`. Proposed 1400px content cap and 16px minimum page inset for shared pages. | Keep a clear page frame as the viewport grows. The wide homepage's extra grid gutter and asymmetric ruler are a homepage composition detail. |
| `section-padding-top`, `section-padding-bottom` | `padding_top` and `padding_bottom` where a section exposes them. Proposed 32px starting points for regular content sections. | Keep vertical section padding on the section and tune the Hero's visual spacing separately during mapping. |
| `spacing-base-narrow`, `spacing-base-wide` | Keep the current 6px and 10px spacing inputs. | Use tight spacing for related measurements, group gaps between content blocks, and section-scale gaps between major groups within a section. |

The Hero is a content-driven panel. Its portrait has a square media frame cropped to a circle. The text and portrait determine its height through the normal page flow. The wide ruler, split and annotated image are signature section composition. Keep the medium-width split compact and let the text precede the portrait in a narrow container. Use the resulting content width to size the portrait, guard title line lengths and position technical marks.

### Identity — Header and navigation

A shallow outlined header aligns with the Hero panel. The wordmark sits at the start, with shop, collections, technology, fit and about grouped in the middle on wide layouts. Search, account when available and bag sit at the end. On narrow screens the wordmark and utility controls stand on one line and a menu control exposes navigation. Use Shopify's actual menu and routes when the header is scoped.

### Identity — Product cards

Use `product-card-image-ratio` = `adapt` as the initial mapping candidate. Center complete eyewear packshots on a pale surface with `contain`. Show the model and color above the price and available product actions. Use outlined rectangular cards with a visible selected swatch ring. Cards move from one column on phone to two on tablet and three on desktop. Ratings, color availability, try-on and favorites need separate scope and real data.

### Identity — Media treatment

- Hero. Use the 1:1 `square` frame with `cover`, keeping the frames, lenses and eyes readable in the circular crop. Keep the marks and two cobalt arcs independent of the photography.
- Geometry and materials. Use intrinsic technical views where measurement labels need to remain in frame. Use tight detail crops in the materials mosaic, with captions positioned where they remain readable.
- Product. Use intrinsic packshots with `contain`. Use the theme's `portrait` 4:5 keyword where the existing product gallery calls for it.
- Editorial. Use the optician portrait and soft violet treatment as a distinct quote panel. Keep text on a stable, readable surface over the image treatment.
- Missing media. Provide a clear editor placeholder. Keep the public typographic hierarchy and CTA intact in a stable text-led composition.

### Identity — Page structure

The homepage sequence is Hero, frame geometry and fit, material and detail, product cards, service strip, optician endorsement and footer. The blueprint frame and numbered headings establish pace. The footer and service strip use compact groups that wrap without squeezing the labels.

Collection, product, cart and content pages use the current Shopify primitives as a starting point. Their branded layouts and any new commerce behavior await their own designs. The accepted prototype covers the homepage and demonstrates examples of browsing interactions for discussion.

## Responsive behavior

| Viewport | Home design intent |
| --- | --- |
| 375px | Collapsed nav. Hero kicker, title, body and CTA above the centered portrait. Keep a single product-card column and stack the technical views. |
| 768px | Condensed nav and a compact Hero split when both columns fit their content. Keep portrait annotations within their figure. Use two product-card columns and allow panels to stack as needed. |
| 1024px | Wide nav and clear left-copy/right-portrait composition. Restore the engineering divider and outer ruler treatment where gutters allow them. Use three product-card columns in a sufficiently wide content frame. |
| 1440px | Cap the page frame, retain the measured desktop balance, and keep the portrait, technical labels and CTA grouped. Keep the gutter and fine rules subordinate to content. |

These widths are review samples. Layout changes where the Hero's own content area can support the split, and intermediate widths keep continuous sizing. Browser zoom and longer localized text can move the content to a stacked composition earlier.

## Elevation & Depth

The page is flat. Panel edges, photography and the controlled editorial wash provide depth. The optional `shadow-sm`, `shadow-md` and `shadow-lg` inputs are omitted for this design draft.

## Shapes

Use square controls and technical panels. Circles are reserved for the Hero crop, ring and product swatches. The softly rounded endorsement image panel is an editorial exception for its own batch.

## Components

| State | Design intent |
| --- | --- |
| Default | Outline the Hero CTA in ink, with short label copy and a trailing arrow. Use a native link for the collection destination. |
| Hover | Use an ink fill and paper label for the Hero CTA where hovering is available. Keep the label and hit area stable. |
| Focus | Apply a clear focus outline with sufficient contrast against adjacent surfaces. |
| Active | Provide brief pressed feedback without shifting text, layout or focus. |
| Selected | Mark chosen fit and swatches with a visible outline or fill and the appropriate semantic state. For Hero, there is no selection control. |
| Disabled or unavailable | Use clear state copy for controls such as unavailable variants. In a Hero with no configured CTA destination, omit the link. |
| Loading | Preserve image space. The Hero link remains native, with no interim custom loading state. |
| Error and success | Use scheme feedback pairs and meaningful copy near the responsible form or control. The Hero contains a link and has no form feedback. |
| Empty | Use the editor placeholder and public text-led layout for missing imagery. Omit empty optional copy or data labels cleanly. |

## Motion

Keep the Hero title, description, CTA and portrait visible at initial render. The ring, crosshairs and ruler are static. Motion is limited to control feedback using the current `motion-duration-fast`, `motion-duration-base`, `motion-duration-slow`, `motion-ease-enter` and `motion-ease-exit` inputs where applicable. For reduced motion use immediate state changes. Mobile menu motion is part of a separate header batch.

## Accessibility

Keep keyboard order aligned with reading order. Provide a meaningful image description when the eyewear or styling contributes information. Decorative marks stay out of accessible names. Model information that serves a real shopping purpose must remain readable and available as text.

Target 48×48 CSS px on the Hero CTA and other key touch controls. Check ordinary text at 4.5:1, large text at 3:1 and essential control edges or icons at 3:1 against adjacent colors. Verify useful links and content with JavaScript disabled, at increased text size and with reduced motion. [Shopify theme accessibility](https://shopify.dev/docs/storefronts/themes/best-practices/accessibility)

## Do's and Don'ts

- Keep the engineering lines quiet and use cobalt sparingly on the paper canvas.
- Preserve the visual order from the wordmark and light italic descriptor to the CTA and then the portrait on phone.
- Treat the ruler, circle and technical marks as part of the Hero composition. Keep the title and CTA as live text.
- Map draft values through theme settings, derived roles and component styles in an approved batch. Keep marketing and product facts tied to real merchant input.
