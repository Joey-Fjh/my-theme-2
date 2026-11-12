# CSS Method

A framework-neutral method for building interfaces from a small, explicit CSS frame: levels, one container primitive, spacing ownership, height kinds, units, media ratios, text categories and colour application. Read it before designing or building any layout, before writing a design draft's layout vocabulary, and when judging whether a style belongs to a container, to content, or to a signature component.

This file names no platform. This repository's bindings (which file, setting or block carries each rule, and which rules are checked) are in `docs/references/style-system/css-architecture.md` and `docs/references/architecture/theme-blocks.md`. Where a binding and this file disagree, the binding describes the current code and this file describes the target.

## Principles

1. **Frame, not implementation.** The frame fixes the vocabulary and the rules; each product fills them with its own design. A solid frame is what makes products fast to build.
2. **Token → semantic interface → application.** Raw values live only in tokens. Code and editors use semantic names (a gap step, a type tier, a height kind), never raw values.
3. **Deliberate controls.** Every option given to an editor or merchant is chosen on purpose: a short enumeration whose values are tokens. Capability can be complete while values stay constrained. Do not add options for flexibility's sake, and do not add load to the person configuring.
4. **Compute before prose.** A rule that a script can check gets a check; prose covers only what cannot be computed.
5. **Content is never clipped.** Heights are minimums; text always fits.

## Five levels

Each level owns its own sizes. A lower level never changes a higher one.

| Level | Owns | Responds to | Typical units |
| --- | --- | --- | --- |
| **L0 Page** | Page width, gutter, full-bleed lines, the rhythm between sections | Viewport breakpoints | `rem`, `%`, `clamp()`; `vw` only here |
| **L1 Section** | Vertical padding, background, width mode, height kind | Viewport breakpoints | Spacing tokens; `svh` for stage heights |
| **L2 In-section layout** | How regions are arranged: grids, splits, rails | Its container's width | `fr`, `minmax()`, `cqi` |
| **L3 Group** | How related items sit: stack, cluster, measure | Its container's width | Gap steps, `ch` |
| **L4 Content** | Only itself: type, line height, detail spacing, media fit | Its own font size | `em`, `aspect-ratio` |

Breakpoints are used at L0 and L1 only. Below L1, layout responds to the container it sits in, because a reusable component cannot know where it will be placed.

L2 and L3 are both built from the container primitive below; the level is a role, not a different tool.

## The container primitive

The container is the one layout abstraction. Flex and grid are its implementation; nobody writes flex or grid detail at the place of use.

**One implementation, two entry points.** Code uses it for fixed regions, with parameters set in code. A visual editor exposes the same primitive through settings. Both produce the same classes and custom properties.

**Interface.** Each option is a short enumeration.

| Option | Values | Applies to |
| --- | --- | --- |
| Layout | flex, grid | always |
| Direction | row, column | flex |
| Distribution (main axis) | start, center, end, space-between, space-around, space-evenly | flex |
| Alignment (cross axis) | start, center, end, stretch, baseline | always |
| Columns | auto (fill by a minimum item width), or 1–6 as a maximum that drops as the container narrows | grid |
| Gap | none and the semantic gap steps | always |
| Width | fill, content, measure | flex |
| Width | fill, measure | grid |
| Height | content, fill parent | always |
| Stack when narrow | on, off: a row becomes a column below a container width | flex, row |

Hide options that do not apply to the chosen layout. Width `content` is flex only. A grid is fill or measure. The user accepted that split on 2026-11-04. It is built: the group block exposes separate flex and grid width settings through the shared container. "Height: fill parent" is what makes distribution visible: space-between only shows when the container is taller than its content.

**Boundary.**

| The container owns | The container does not own |
| --- | --- |
| Arrangement, direction, distribution, alignment, columns | Its children's look (type, colour, media ratio) |
| The gap between its children, in tokens | Its children's margins (children have none) |
| Its own width and height mode | Viewport breakpoints |
| Being a container-query root; stacking when narrow | Interaction behaviour (carousels, tabs belong to components) |
| | Any visual surface: background, padding, border, radius, shadow |
| | Signature layouts |

Anything with a look of its own (a thumbnail, a product card, a chip, a text panel over an image) is content or a component and owns its appearance. A container that needs a surface is a component, not a configured container.

**Depth.** A composed region usually needs one container with content inside. Counting the section, that is three levels. Nest another container only when the design needs an uneven distance or a sub-arrangement.

## Containment rule

A container responds to its own width through container queries and container units. Inline-size containment changes how the element is sized. MDN, `container-type` (https://developer.mozilla.org/en-US/docs/Web/CSS/container-type): the inline size "can be computed in isolation, ignoring the child elements", and "If a contextual or explicit size is not available, elements with size containment will collapse." Container queries are Baseline widely available (since February 2023).

Therefore:

- A container whose width mode is **fill** or **measure** sets `container-type: inline-size`, because its width comes from its parent. A grid container is one of these two widths.
- A container whose width mode is **content** is a flex container. It does not set `container-type`, because its width comes from its children and containment would collapse it. Its children respond to the nearest ancestor container. Grid has no content width.
- A fill-width container that is an item in an unstacked row flex layout grows and shrinks from a nonzero basis (`flex-grow: 1`, `flex-shrink: 1`), with `min-width: 0` and `width: auto`. The basis is the size flex starts from. It is not a minimum width. A used width above zero does not mean the text or the controls inside are usable, and it does not prevent overflow. A content-width item and a measure-width item keep their own row rules. The same shorthand applies while a row is unstacked, including a stack-on row above its stack threshold. While a stack rule matches, that rule replaces this shorthand. The binding names the basis. The user accepted this rule on 2026-11-05.
- Stack-off is a composition boundary, not a fit guarantee. Check the actual text, controls, number of siblings and gap at the narrowest parent that composition sits in. Viewport width alone is not that check. A composition that does not fit uses stack-on or another arrangement, and that arrangement is checked the same way. The threshold that turns a stack-on row into a column does not make an arbitrary stack-off composition fit. This rule adds no wrap, scroll, clip, hidden overflow, new minimum width, or silent stack change.
- Automatic grid columns use `repeat(auto-fit, minmax(<min>, 1fr))`. Never size a container's track with `auto` or `max-content`.
- `container-type: size` (block axis too) is used only where the height is already defined, such as a stage.

## Spacing ownership

- **The container gives the space.** The gap between siblings is the container's gap, chosen from the semantic steps. Content carries no outer margin, because the same content is reused in different parents.
- **Uneven distances are nesting.** When three items sit close and a fourth sits apart, they are two groups: an inner container with a small gap, inside an outer container with a larger one. Do not encode relationships as per-item spacing settings: in an editor, which item follows which is arbitrary.
- **Detail inside one piece of content uses `em`**: icon to label, a rule under a price, a link underline, button padding. It follows the font size.
- **Large-grain spacing** (between sections, a section's own padding) belongs to L0 and L1 and follows the platform's conventions.
- Order the gap steps by relationship: parts of one item, items of one group, groups inside a block, the header group to the body. The space above a heading is larger than the space below it, so the heading binds to what it introduces.

## Height kinds

Decide by content type, not by habit.

**Content-driven** (lists, grids, body text, media-and-copy splits): height comes from content. Thresholds apply to media, not text. Media keeps its frame through `aspect-ratio` and is capped on tall screens (for example a maximum block size near `80svh`).

**Stage** (hero, slideshow, banner): a bounded height, always as a minimum.

- `min-height: clamp(<floor>, <preferred>, <cap>)`.
- The preferred value comes from either the media ratio (adapt to the first image, or a fixed ratio, set separately for narrow and wide) or a screen fraction (small, medium, large, full).
- The floor is in `rem`, so the copy fits on small screens. The cap is at most one screen.
- Media is a background layer: `object-fit: cover` with the focal point.
- Overlaid text is placed on a nine-position grid, over a scrim from the colour roles (the scrim sits between the media and the text), at a measure in `ch`. On narrow widths the default is media, then text, stacked; overlay stays available.
- Slides share the stage height.

Never use a fixed `height` on a box that holds text.

## Units

| Unit | Use for | Why |
| --- | --- | --- |
| `clamp()` with `rem` | Fluid type and space scales | One scale across widths, still responsive to the user's font size |
| `rem` | Control sizes, breakpoints | Follows the user's default font size |
| `em` | Detail bound to text: icon gaps, button padding, letter spacing | Follows the local font size |
| `ch` | Reading measure (about 65ch) | Readable line length is about 45–75 characters |
| `%`, `fr`, `minmax()` | Grid tracks | Proportional and content-aware |
| `cqi` | Sizes that follow the container | Container-relative. A font size in `cqi` must sit inside a `clamp()` with a `rem` floor: without it, text stops growing with the user's font size (WCAG 2.1 SC 1.4.4 Resize Text) |
| `cqb` | Only inside a container with a defined height | Needs block-size containment |
| `svh` | Stage heights | Stable while mobile browser bars move |
| `dvh` | Overlays and drawers only | Tracks the visible area as it changes |
| `vh`, `lvh` | Not used | Jump or overflow on mobile |
| `px` | Borders, hairlines, focus rings, icon sizes | These should not scale with the screen; touch targets are at least 24px |

## Media ratios

Use one ratio vocabulary for the whole product: square, portrait, landscape, wide, and adapt (the media's own ratio). Every component chooses from it; nobody invents a ratio at the place of use. A frame is an `aspect-ratio` box. Its media fills it with `object-fit: cover` and the focal point by default. `contain` on a fill colour is for packshots on a transparent or white ground. The exact numbers are part of the binding.

## Text categories

One type chain feeds every element: families, weights, sizes, line heights and letter spacing all come from it. Categories change which step is taken and by which rule, never the source.

- **Plain text: body.** The viewport-fluid scale and a measure in `ch`.
- **Plain text: display headings.** Their tier, capped by the container: `min(<tier>, <cqi cap>)` inside a `clamp()` with a `rem` floor. The cap is expressed in type steps, so a heading never overflows a narrow container.
- **Wrapped text** (buttons, links, labels, fields): fixed low steps, with padding in `em`. Two control sizes, standard and large, unless a design needs more. Wrapped text never scales with its container, so the same control looks the same everywhere.
- **Fit text** (countdown digits, oversized wordmarks): fills its container in `cqi` between a floor and a cap expressed in type steps. It belongs to a signature component.
- **Line height and letter spacing** tighten as size grows (the largest titles near 1.1, body near 1.5–1.6) and widen on small uppercase labels.
- **Wrapping:** headings use `text-wrap: balance`; body uses `pretty` where supported, as an enhancement.

## Colour application

Colour is one set of encapsulation and application. Surfaces come as schemes, each a background with its foreground counterparts. Secondary text, lines, quiet surfaces, scrims and shadows are derived from the scheme, not chosen one by one. What else is encapsulated depends on the components a product builds. Every action colour and every scrim comes from a scheme role, so a scheme change restyles it.

## Signature layouts

Generic containers cover the regular regions. A product's identity lives in layouts the generic container should not try to express: overlap, offset, art-directed arrangements. These are component CSS owned by one section or component and designed per product. They still take values from tokens and still respect the units and height rules. The design draft names which layouts are signature.

## Verification

- Turn every rule a script can check into a check with zero tolerance on a clean code base: spacing values only from tokens or relative units, no outer margin on content, `cqi` font sizes only inside a `clamp()` with a `rem` floor, no forbidden viewport units.
- Check layout in a browser at 375, 768, 1024 and 1440, plus the widths at which a container stacks.
- Judge visual changes in the browser, not only in review.

## Sources

- W3C: [CSS Conditional Rules Level 5, Container Relative Lengths](https://www.w3.org/TR/css-conditional-5/#container-lengths).
- MDN: `container-type`, container queries, viewport units, `aspect-ratio`, `text-wrap`.
- WCAG 2.1: SC 1.4.4 Resize Text; SC 1.4.3 and SC 1.4.11 contrast (4.5:1 body text, 3:1 large text and non-text elements). WCAG 2.2: SC 2.5.8 Target Size (Minimum), 24 by 24 CSS pixels, which the Shopify Theme Store requirements also set.
- Every Layout (layout primitives, intrinsic layout); CUBE CSS (composition separated from blocks); Utopia (fluid type and space scales).
- Figma Auto Layout (direction, spacing, alignment, distribution, hug and fill sizing), and design-system layout components (Braid, Polaris, SwiftUI stacks): the same container model in design tools and code.
- This repository's bindings: `docs/references/style-system/css-architecture.md` (CSS Method bindings) and `docs/references/architecture/theme-blocks.md`.
