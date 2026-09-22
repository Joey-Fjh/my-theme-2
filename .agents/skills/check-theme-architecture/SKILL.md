---
name: check-theme-architecture
description: Validate Shopify theme architecture and static browser compatibility rules. Use when Liquid, embedded stylesheet or javascript blocks, tab markup, or browser compatibility tooling change.
when_to_use: >
  Liquid runtime-name shadowing, tab accessibility, Liquid output syntax,
  or CSS/JS compatibility checks changed.
---

# Check Theme Architecture

Use this skill for project-level architecture and static compatibility validation. Shopify Theme Check remains the platform authority for schema validity, parser-blocking scripts, and other built-in theme rules. This skill supplements Theme Check with a small set of low-false-positive project contracts.

## Command Families

- `npm.cmd run lint:theme` — the five project rules listed below.
- `npm.cmd run lint:liquid-syntax` — strict Liquid output parsing guard beyond ordinary Theme Check usage.
- `npm.cmd run lint:compat` — first-party CSS, JS, and embedded Liquid `{% stylesheet %}` / `{% javascript %}` compatibility checks.
- `npm.cmd run lint:compat:embedded` — embedded Liquid block scan; this is part of `lint:compat`, not `lint:theme`.
- `npm.cmd run scan:compat` — rebuild Tailwind output, then run all compatibility checks.
- `npm.cmd run test:theme-architecture` — focused fixture tests for the scripts above.
- `npm.cmd run test:section-stylesheet-carry` — DOM tests for `SectionRefresher.carryInnerSectionStylesheet` extracted from `assets/https.js`.
- `npm.cmd run test:motion-reveal-batch` — tests for the reveal batching helper in `assets/motion-reveal-batch.js`.
- `npm.cmd run lint` — aggregate gate that includes the commands above when a broader check is requested.

## What `lint:theme` Covers

Liquid files under `layout/`, `sections/`, `snippets/`, `blocks/`, and `templates/`; CSS in `tailwind/**/*.css`, `assets/*.css`, and Liquid `{% stylesheet %}` blocks. A Liquid file that fails to parse is reported.

1. Do not `assign` or `capture` over protected Shopify Liquid runtime names.
2. Static `role="tab"` elements must include `aria-selected` and `aria-controls` (`aria-*`, `:*`, or `x-bind:*` forms).
3. At most one `{% stylesheet %}` and one `{% javascript %}` tag per file, with no Liquid output or tags inside them (`docs/references/style-system/css-architecture.md`, "Bundled Asset Tag Constraints").
4. Scheme color variables take alpha as `rgba(var(--color-*), alpha)`, never `rgb(var(--color-*) / alpha)` (`docs/references/style-system/css-architecture.md`, "Color, Surface, And Inline Style").
5. A `[data-motion-reveal]` selector must not hide its target (`opacity: 0`, `visibility: hidden`, `display: none`) unless the selector also names a runtime state attribute (`docs/references/architecture/motion-architecture.md`).

## What This Skill Does Not Enforce Yet

Other rules in `docs/references/` have no check yet, for example typography-tier placement (`heading-h*` only on headings), CSS layer placement, and JS runtime conventions. Review enforces them. Whether a rule gets a check is decided per rule by the user, following the `AGENTS.md` rule-ownership bullet.

## When To Run

- After Liquid changes that may shadow protected runtime names or tab markup.
- After embedded stylesheet/javascript block changes: run `lint:compat`.
- After Tailwind source changes: run `scan:compat`.
- After changes to `SectionRefresher.carryInnerSectionStylesheet` in `assets/https.js`: run `test:section-stylesheet-carry`.
- Do not auto-fix merchant-owned configuration or content while resolving lint failures.

## Reporting

Report failures by file, line, and command family. If a finding is pre-existing, say so and classify it as a warning or follow-up according to `AGENTS.md`.
