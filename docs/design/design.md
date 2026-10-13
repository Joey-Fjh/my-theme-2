---
version: alpha
name: Skeleton baseline
description: The neutral defaults this repository ships. A theme replaces or supplements them from its design draft.
omitted:
    - section: rounded
      reason: The baseline defines no radius token; corners are square until a theme adds one.
    - section: components
      reason: The baseline styles controls in code and defines no component tokens.
colors:
    primary: '#111827'
    neutral: '#ffffff'
    inverse-background: '#111827'
    inverse-foreground: '#ffffff'
    success-background: '#ecfdf5'
    success-foreground: '#065f46'
    error-background: '#fef2f2'
    error-foreground: '#991b1b'
typography:
    title-4xl:
        fontFamily: Inter
        fontSize: 95.37px
        fontWeight: 700
        lineHeight: 1.2
        letterSpacing: -0.01em
    title-3xl:
        fontFamily: Inter
        fontSize: 76.29px
        fontWeight: 700
        lineHeight: 1.2
        letterSpacing: -0.01em
    title-2xl:
        fontFamily: Inter
        fontSize: 61.04px
        fontWeight: 700
        lineHeight: 1.2
        letterSpacing: -0.01em
    title-xl:
        fontFamily: Inter
        fontSize: 48.83px
        fontWeight: 700
        lineHeight: 1.2
        letterSpacing: -0.01em
    title-l:
        fontFamily: Inter
        fontSize: 39.06px
        fontWeight: 700
        lineHeight: 1.2
        letterSpacing: -0.01em
    title-m:
        fontFamily: Inter
        fontSize: 25px
        fontWeight: 700
        lineHeight: 1.2
        letterSpacing: -0.01em
    title-s:
        fontFamily: Inter
        fontSize: 20px
        fontWeight: 700
        lineHeight: 1.2
        letterSpacing: -0.01em
    title-xs:
        fontFamily: Inter
        fontSize: 16px
        fontWeight: 700
        lineHeight: 1.2
        letterSpacing: -0.01em
    copy-xl:
        fontFamily: Inter
        fontSize: 25px
        fontWeight: 400
        lineHeight: 1.6
        letterSpacing: 0em
    copy-l:
        fontFamily: Inter
        fontSize: 20px
        fontWeight: 400
        lineHeight: 1.6
        letterSpacing: 0em
    copy-m:
        fontFamily: Inter
        fontSize: 16px
        fontWeight: 400
        lineHeight: 1.6
        letterSpacing: 0em
    copy-s:
        fontFamily: Inter
        fontSize: 12.8px
        fontWeight: 400
        lineHeight: 1.6
        letterSpacing: 0em
spacing:
    step-3xs: 2.5px
    step-2xs: 5px
    step-xs: 7.5px
    step-s: 10px
    step-m: 15px
    step-l: 20px
    step-xl: 30px
    step-2xl: 40px
    step-3xl: 60px
    step-4xl: 80px
---

# Skeleton baseline

This file is the starting point of a theme made from this repository. It describes the defaults the code ships, in the open DESIGN.md format. A theme does not design against it: it replaces or supplements these values from its design draft, following `docs/references/style-system/design-to-delivery.md`.

Every value here is read from the code. Where a value lives is named in each section, because that is where a theme changes it. The front matter gives the wide-end value of each fluid token (a viewport 1280px wide or more); the tables give both ends.

## Overview

The baseline has no brand character. It is a plain storefront: one typeface, two colour schemes, square corners, and motion limited to a loading indicator. Density, hierarchy and personality are for the theme's design draft to set.

## Colors

Colours are merchant settings, grouped in colour schemes in `config/settings_data.json` and defined by the `color_schemes` group of `config/settings_schema.json`. A section picks a scheme; the page canvas uses the scheme named by `page_canvas_color_scheme`.

| Token | Value | Scheme and role |
| --- | --- | --- |
| `neutral` | `#ffffff` | `scheme-2` background, the default page canvas |
| `primary` | `#111827` | `scheme-2` text and border |
| `inverse-background` | `#111827` | `scheme-1` background |
| `inverse-foreground` | `#ffffff` | `scheme-1` text and border |
| `success-background` / `success-foreground` | `#ecfdf5` / `#065f46` | Both schemes |
| `error-background` / `error-foreground` | `#fef2f2` / `#991b1b` | Both schemes |

The code derives further roles from each scheme, so a theme does not set them one by one: secondary and tertiary text, lines, quiet surfaces, scrims and shadows are the scheme foreground or background at fixed alpha steps (`snippets/css-variables.liquid`, `tailwind/tailwind.input.css`). A design draft that needs a colour no role gives is a gap to decide, not a literal to paste.

## Typography

The font families, body sizes, weights, line heights and letter spacing are merchant settings in `config/settings_schema.json`. The type steps are computed from the body sizes in `snippets/css-variables.liquid`; the utilities are in `tailwind/tailwind.typography.css`.

- Family: Inter for headings and body (`type_header_font`, `type_body_font`).
- Heading weight 700, line height 1.2, letter spacing −0.01em. Body weight 400, line height 1.6, letter spacing 0.
- Body size 16px on mobile and desktop (`body_font_size_mobile`, `body_font_size`). Heading scale 100% (`heading_scale`).

Each step is the body size times a ratio raised to the step number. The ratio runs from 1.2 at a 375px viewport to 1.25 at 1280px.

| Utility | Step | At 375px | At 1280px |
| --- | --- | --- | --- |
| `copy-s` | −1 | 13.33px | 12.8px |
| `copy-m`, `title-xs` | 0 | 16px | 16px |
| `copy-l`, `title-s` | 1 | 19.2px | 20px |
| `copy-xl`, `title-m` | 2 | 23.04px | 25px |
| `title-l` | 4 | 33.18px | 39.06px |
| `title-xl` | 5 | 39.81px | 48.83px |
| `title-2xl` | 6 | 47.78px | 61.04px |
| `title-3xl` | 7 | 57.33px | 76.29px |
| `title-4xl` | 8 | 68.8px | 95.37px |

## Layout

- **Space scale** (`tailwind/tailwind.input.css`): ten fluid steps on one base that runs from 6px at 375px to 10px at 1280px.

    | Step | × base | At 375px | At 1280px |
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

- **Semantic spacing:** `tight` is `step-2xs`, `related` is `step-s`, `group` is `step-m`, `section` is `step-xl`. Map a design's spacing to these first.
- **Breakpoints** (`tailwind/tailwind.input.css`): `tablet` 768px, `desktop` 1024px, `wide` 1280px.
- **Page frame** (merchant settings `page_width` and `page_margin`): 1200px wide with a 20px margin, which are the setting defaults.
- Controls keep fixed padding; the space scale is for space between elements.

## Elevation & Depth

Three shadow roles, `shadow-sm`, `shadow-md` and `shadow-lg`, in `tailwind/tailwind.input.css`. Their strength follows the scheme: stronger on a dark background (`snippets/css-variables.liquid`). The baseline uses none of them by default.

## Shapes

No radius token. Corners are square. A theme whose design draft has rounded corners adds the token; that is a gap to decide in its own batch.

## Components

The baseline styles a button and a text field in `tailwind/tailwind.elements.css` and defines no component tokens. A theme's design draft describes its components here.

## Do's and Don'ts

- Do map a design draft's value to the place that already exists before adding a new one.
- Do keep text contrast at WCAG AA on every scheme; `npm.cmd run scan:contrast` reports it.
- Don't paste a literal colour, size or spacing value into a section; `npm.cmd run lint:theme` rejects most of them.
- Don't make touch devices depend on hover.

## Motion

Durations and easings are code-owned tokens in `snippets/css-variables.liquid`: fast 250ms, base 400ms, slow 500ms; one ease-out curve for entering and default motion, one ease-in curve for exits. The baseline animates only the loading indicator. A theme's motion follows `docs/references/architecture/motion-architecture.md`.
