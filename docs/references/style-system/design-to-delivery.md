# Design To Delivery

This reference is the procedure a derived theme follows from a design input to its settings, default preset, and built sections. `AGENTS.md` remains the rule source. Read it when a theme starts its design, drafts its design language, or maps design values to settings.

**Status:** the procedure is written against the CSS framework contract (batch DL1-B1) and the slot template in `DESIGN.md`. B2a's shared container is built and accepted. B2b's typography is implemented, code-reviewed PASS and accepted within the user's confirmed mother-template architecture and completed technical-verification boundary. B2c's accent pair and shared image ratios are implemented, coordinator review PASS, user visual acceptance passed on 2026-11-10; B3's four CSS method checks are implemented, with independent code review PASS (2026-11-10). The design procedure itself has not been run end to end on a derived theme; the first theme to run it corrects this file through its own rule-change batch if reality diverges.

## Principle

The approved design draft is the basis of a theme. Its values are read and mapped into the chain: a value that has a place replaces the default there; a value that has no place is a gap, decided as mapping describes. Defective or incomplete drafts are corrected in the draft (or rejected at the generation gate); mapping does not bypass missing systems by pasting literals into sections.

This repository ships an **unfilled slot template** at `DESIGN.md`. A derived theme replaces placeholders with its approved design language. The user approves the filled draft before mapping and build.

Agents map the draft; they do not invent brand values the draft does not give, and they do not paste a value past the chain.

## CSS vocabulary the procedure targets

The design input and the slot template use the method's vocabulary. The bindings distinguish current implementation, retained guidance, and unbuilt capabilities. Read these references; do not restate unbuilt frame work as current code.

| Topic | Reference | Notes |
| --- | --- | --- |
| Layout method (five levels, container primitive, spacing ownership, height kinds, units, signature layouts) | `docs/references/style-system/css-method.md` | Framework-neutral rules |
| Shopify bindings (settings chain, type categories, colour checks, CSS homes) | `docs/references/style-system/css-architecture.md` | Current built bindings include B2a/B2b and B2c's accent/ratio implementation; B3's four stricter lints are implemented, with independent code review PASS (2026-11-10) |
| Theme blocks and the shared container | `docs/references/architecture/theme-blocks.md` | B2a's Group editor and code entry share the built, accepted container implementation |
| Image display and ratio vocabulary | `docs/references/style-system/image-display-contract.md` | `snippets/image.liquid` resolves `square`, `portrait` (4:5), `landscape`, `wide` (16:9) and `adapt`; all five are available in the global product-card ratio setting |
| Motion policy | `docs/references/architecture/motion-architecture.md` | Motion tokens are code-owned unless a plan adds policy settings |

## Input pack

Assemble this pack **before** generating a design draft. The user chooses how to produce the draft; this procedure names no design tool, plugin, or hosted service.

| Item | Content |
| --- | --- |
| **Brief** | The derived theme's `docs/project.md`: identity, merchant, catalog, and whether Theme Store submission is in scope. Supporting notes may add references; they do not replace that file. |
| **CSS vocabulary** | The references in the table above, especially bindings the draft must respect. |
| **Slot template** | `DESIGN.md` in this repository (copied into the derived theme unchanged in structure). |
| **Reference DESIGN.md files** | Two or three open-format design-language files from comparable brands or themes (structure and density, not code to paste). |
| **Comparable storefronts** | Live or screenshot references for navigation, cards, media, and page rhythm. |
| **Generation gate** | The checklist in [Generation gate](#generation-gate); the user judges pass or fail before mapping. |

Create `docs/design/` in a derived theme only when brief notes, links or previews need a local home; the mother template does not ship this directory or a placeholder. <!-- doc-paths: ignore -->

The repository ignore file ignores design screenshots and reference images in that optional directory: png, jpg, jpeg, webp, gif, and mp4. HTML exports and other extensions there are not in that ignore list.

## Tool-neutral generation

Design generation happens outside implementation batches, with whatever workflow the user chooses (manual authoring, assisted drafting, export from another system, and so on). Requirements on the **output**, not the tool:

1. **Filled design language file** — a complete `DESIGN.md` in the open DESIGN.md format (see [DESIGN.md format and designmd](#the-designmd-format-and-designmd-cli)). Every slot in the template is either filled with draft values or explicitly marked as intentional omission with rationale.
2. **Key-page previews** — static previews for the pages the brief names, at **375**, **768**, **1024**, and **1440** CSS pixels width. Raster and MP4 files saved in the optional design-reference directory match the ignore globs above. An HTML preview saved there is not ignored by those globs.
3. **Gate evidence** — the user can point to where the draft satisfies each generation-gate item (sections in the file, preview set, or lint output).

React or other component libraries among references are **motion and layout references only**; their code is not used (`AGENTS.md` excludes React as runtime).

## Generation gate

Do not start mapping or preset work until the user accepts the draft against this gate. Reject or revise the draft when any item fails.

| Area | Gate |
| --- | --- |
| **Colour system** | Coherent schemes using only the fillable token names in `DESIGN.md`. On every scheme, contrast meets the thresholds in [Source evidence](#source-evidence): 4.5:1 where that source requires it, 3:1 where that source requires it, for the objects named there. |
| **Type system** | Coherent families, loaded weights, settings-backed styles, and code-owned steps, including wrapped control sizes and display headings. |
| **Spacing system** | Coherent space-scale steps and semantic names. Section padding stays on the section px settings; it is not `--spacing-section`. |
| **States** | Hover, focus, active, selected, disabled, unavailable, loading, error, success, and empty are each described or omitted with a reason. |
| **Widths** | Behavior at **375**, **768**, **1024**, and **1440** CSS pixels is shown in the previews and stated in the draft. |
| **Mobile design** | The narrow width is designed as its own layout, not only a scaled desktop. |
| **Layout vocabulary** | Page frame, ratio vocabulary (portrait **4:5** where used), and height-kind intent for stages when the theme uses them. |
| **Identity** | Names the target merchant from the derived theme's `docs/project.md` and the four systems: header and navigation, product cards, media treatment, and page structure. When that file scopes Theme Store submission, the draft cites the comparable Theme Store themes from the input pack and states a structural difference for each of the four systems. A colour or type swap is not that evidence. The user judges distinctiveness before build. When submission is not in scope, the four systems are still named, and Theme Store comparison is not required. Submission is not assumed for every derived theme. |
| **Motion** | Enters, exits, and reduced-motion intent per `docs/references/architecture/motion-architecture.md`. |
| **Accessibility** | Focus visibility, the touch-target intent in [Source evidence](#source-evidence), motion sensitivity, and non-hover dependencies. |
| **Do's and don'ts** | Brand-specific guardrails for agents and implementers. |
| **designmd lint** | `designmd lint` reports **zero errors** on the **filled** draft only (see [Unfilled template vs filled draft](#unfilled-template-vs-filled-draft)). The unfilled slot template is not this gate. |

## Where results land

The procedure produces input for the chain that `docs/references/style-system/css-architecture.md` describes:

```text
config/settings_schema.json + config/settings_data.json
  -> snippets/css-variables.liquid
  -> tokens
  -> tier and scheme classes in Liquid markup
```

Nothing in this procedure bypasses that chain.

## Steps

Each step is a batch under the Batch SOP in `AGENTS.md`, with its own acceptance checks. Steps may be combined only when a plan says so. **Design approval does not authorize implementation**; each build or preset batch still needs explicit user authorization.

| Step | Input | Output | Who decides |
| --- | --- | --- | --- |
| 0. Input pack | User goals | Brief, vocabulary, template, references, gate checklist | User |
| 1. Draft | Input pack | Filled `DESIGN.md` and key-page previews | User judges draft; coordinator or user files the result |
| 2. Generation gate | Draft and previews | Pass or revise | User |
| 3. Design approval | Gated draft | Recorded approval to treat the file as the theme's design language | User |
| 4. Mapping | Approved design language compared with the slot template | Table: each value → settings-backed place, code-owned place, or gap | Coordinator proposes; user decides each gap |
| 5. Values | Mapping table | Agreed value per mapped place | User approves |
| 6. Preset | Settings-backed mapped values | Defaults in `config/settings_schema.json` and the default preset in `config/settings_data.json` | User authorizes in that batch's plan only |
| 7. Build | Preset and design language | Sections and blocks that consume tokens and tier or scheme classes, **one section or coherent slice at a time** when the plan says so | Implementer under `lint:theme` |
| 8. Verify and accept | Built pages | Browser pass at **375, 768, 1024, and 1440** for **visual** batches, then user acceptance | User (see `AGENTS.md` Batch SOP step 8) |

Notes on selected steps:

- **Step 4, mapping kinds.** The chain has two kinds of place today; the mapping table marks which kind each value uses:
    - **Settings-backed:** colour scheme fields in `config/settings_schema.json` (`color_schemes` definition: `background_color`, `background_gradient_color`, `text_color`, `border_color`, optional accent pair, success and error pairs); `page_canvas_color_scheme`; typography font pickers (`type_header_font`, `type_body_font`) and their loaded weights via `snippets/css-variables.liquid`; heading and body weight, line height, letter spacing, and text transform settings; `body_font_size` and `body_font_size_mobile` (the 1280px and 375px endpoints of the shared type steps, not a switch at the `desktop` breakpoint); `heading_scale` (the heading multiplier on those steps); layout `page_width` and `page_margin`; global `product_card_image_ratio`. Values land in step 6. `copy-*` and `title-*` both consume the computed steps; titles also multiply by `heading-scale` (`tailwind/tailwind.typography.css`).
    - **Adjustable code inputs:** spacing-base endpoints, type-ratio endpoints, the three shadows, and the motion durations and easings named in `DESIGN.md`. The structure stays fixed. The draft may propose the values. An authorized code batch writes them into `tailwind/tailwind.input.css` or `snippets/css-variables.liquid`. They are not new merchant settings (`motion-architecture.md` still limits motion settings to policy).
    - **Computed outputs:** each `--spacing-step-*` from the spacing base, each `--type-step-*` from the body-size endpoints and the type ratio, derived colour roles, and the per-scheme shadow alphas. The draft does not set these one by one. `--font-body-scale` stays `1`.
    - **Section padding** is settings-backed and section-owned (`padding_top`, `padding_bottom` on the sections that define them). It is not the code token `--spacing-section`.
    - **Built frame inputs:** B2a's container settings, containment, narrow stacking and semantic gap aliases; B2b's standard/large control recipes, display-heading container cap and per-tier line-height/tracking factors. B2a is accepted; B2b's code review passed and the user accepted its mother-template architecture and completed technical-verification boundary. These are existing implementation places, not missing frame features.
    - **B2c implementation:** optional `accent_background_color` and `accent_foreground_color` settings emit per-scheme RGB triplets; unset values fall back independently to scheme text/background. Existing buttons do not consume the new slots. `snippets/image.liquid` owns the five-keyword ratio vocabulary. Coordinator review is PASS; user visual acceptance passed on 2026-11-10; no merchant accent values or new design direction are implied.
    - **Checks and unbuilt capabilities:** B3's stricter lints listed in `css-architecture.md` are implemented, with independent code review PASS (2026-11-10). Stage-height settings and additional context-dependent unit enforcement remain unbuilt; the user closed them as current mother-template delivery obligations on 2026-11-11. Their methods and existing infrastructure remain available. A concrete design that needs these capabilities calls for a new scoped decision in that theme. Mapping treats unbuilt slots as gaps, not as current settings or automatic mother-template backlog items; other capability states remain as identified in `css-architecture.md`.
    - A value with no place of either kind is a **gap**. Each gap is decided once: new setting or token (architecture batch), signature component CSS for one section, or defer until its named future batch lands.
- **Step 6, merchant protection.** `config/settings_data.json`, live merchant edits in the theme editor, and merchant-chosen scheme values are merchant-owned. Mapping and preset batches **replace defaults only** with explicit authorization; they do not overwrite merchant-chosen values without a `Merchant-Change:` authorized commit (`AGENTS.md`, Core Rules).
- **Step 7.** Anything a section needs outside the chain is a named exception in the plan, not a silent literal.
- **Step 8.** Every **visual** batch (sections, blocks, preset-facing visual tokens, or design-token work that changes rendered UI) ends with a browser pass at the four widths above and explicit user acceptance. Non-visual batches follow the plan's runtime verification when one applies.

## The DESIGN.md format and designmd CLI

The design-language file follows the open **DESIGN.md** format maintained at [google-labs-code/design.md](https://github.com/google-labs-code/design.md) (Apache 2.0). The format version is **alpha**. Read the current specification before drafting; it still changes.

Verified on **2026-11-04** with the CLI shipped in `@google/design.md` **v0.4.0**:

```text
npx.cmd -y -p @google/design.md designmd --help
```

Commands: `lint`, `diff`, `export`, `spec`. On Windows, invoke **`designmd`**; the package's alternate command name `design.md` is not used here.

| Command | Use in this procedure |
| --- | --- |
| `designmd spec` | Read the current schema and section order. |
| `designmd lint <file>` | Structural and contrast checks on a **filled** draft at the generation gate. |
| `designmd diff <a> <b>` | Compare drafts or a draft against an earlier filled baseline. |
| `designmd export` | Optional aid when writing tokens; never paste export output over `tailwind/tailwind.input.css` (resets, roles, and fluid formulas differ). |

Example lint invocation:

```text
npx.cmd -y -p @google/design.md designmd lint DESIGN.md
```

The YAML front matter holds machine-readable tokens for lint and export. It is **not** the runtime token source: settings-backed values live in the preset, and code-owned values live in `tailwind/tailwind.input.css` and `snippets/css-variables.liquid`.

Specification sections this procedure relies on: optional front matter (`version`, `name`, `description`, `omitted`, `colors`, `typography`, `rounded`, `spacing`, `components`); markdown body sections such as Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, and Do's and Don'ts; preservation of unknown sections so themes can add identity, responsive behavior, motion, accessibility, and states.

### Unfilled template vs filled draft

| Artifact | Front matter | `designmd lint` |
| --- | --- | --- |
| **Slot template** (`DESIGN.md` in the mother template) | Declares `omitted` for token groups; documents slots in the body with setting IDs and code paths | **Not a gate target.** Lint may report only informational findings or none; the generation gate applies to the derived theme's **filled** file. |
| **Filled design draft** | Complete token groups (or deliberate `omitted` entries with reasons) matching the approved design | Must pass with **zero errors** at the generation gate |

Do not claim the unfilled mother-template file passes the filled-draft gate.

## Fixed slots and roles

`DESIGN.md` has two layers. **Fillable draft tokens** fix the names a draft may write, the setting or code input each name maps to, the design role, the allowed use, and the prohibited use. Adjustable code inputs are the spacing-base endpoints, the type-ratio endpoints, the three shadows, and the motion durations and easings. Computed steps and derived colour roles are not separate fillable values. **Runtime variables** list current CSS custom properties. A runtime inventory does not satisfy the fillable-token rule. B3 checks are implemented with the static boundaries documented in `css-architecture.md`; independent code review PASS (2026-11-10). Derived themes keep the names; they do not add free names or brand values in the unfilled template.

## Source evidence

Checked **2026-11-04** through Shopify Dev MCP (`search_docs_chunks` on the authenticated Shopify docs server). No fallback to an unofficial page.

| Claim this procedure relies on | Source |
| --- | --- |
| `font_picker` returns a font from the Shopify font library (system fonts and a selection of Google Fonts). `font_modify` returns a variant of the same family when it exists, and `nil` when it does not. `font_face` emits the `@font-face` rule. | [Input settings](https://shopify.dev/docs/storefronts/themes/architecture/settings/input-settings), [Fonts](https://shopify.dev/docs/storefronts/themes/architecture/settings/fonts), [font_modify](https://shopify.dev/docs/api/liquid/filters/font_modify) |
| Theme Store font requirement, only when a theme is submission-scoped: the CSS loads bold, italic, and bold-italic variants for each font using `font_modify`. This mother template does not make submission mandatory. | [Theme store requirements](https://shopify.dev/docs/storefronts/themes/store/requirements) |
| Touch targets: WCAG 2.2 SC 2.5.8 is 24×24 CSS px at Level AA. The same Shopify page recommends 48×48 CSS px for interactive elements and states that figure also covers WCAG 2.1 SC 2.5.5 (44×44, AAA) and Material's 48×48. The slot records the design's intent; it does not add a new repository rule. | [Increase tap target size](https://shopify.dev/docs/storefronts/themes/best-practices/performance/increase-tap-target-size) |
| Contrast, checked 2026-11-04. Text smaller than 24px regular, or smaller than 18.5px bold, is 4.5:1 against its background. Text at those sizes or larger is 3:1. Icons are 3:1. Input borders are 3:1. | [Accessibility best practices](https://shopify.dev/docs/storefronts/themes/best-practices/accessibility) |
| Contrast when `docs/project.md` scopes Theme Store submission. Main body content is 4.5:1. Text larger than 18pt, and non-text elements such as borders and icons, are 3:1. This does not make submission mandatory. | [Theme store requirements](https://shopify.dev/docs/storefronts/themes/store/requirements) |

DESIGN.md format and `designmd` behavior are from the CLI run recorded in the execution log (`@google/design.md` v0.4.0), not from an older quotation.

## What this procedure does not fix

- The tools of steps 0–1: the user chooses them per theme.
- Any skill. `AGENTS.md` (Agent Skills) names vendored skills and their triggers.
- Frame code or lints in DL1-B2 and DL1-B3; the procedure cites them but does not implement them.
- Theme Store submission completeness unless the user scopes a theme or batch to submission.
- Values inside the slot template until a derived theme's approved draft fills them.
