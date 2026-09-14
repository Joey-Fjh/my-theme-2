---
name: check-theme-architecture
description: Validate Shopify theme architecture and static browser compatibility rules. Use when Liquid, embedded stylesheet/javascript blocks, accessibility guardrails, or browser compatibility tooling change.
when_to_use: >
  Liquid runtime-name shadowing, tab accessibility, SVG WebKit guardrails,
  Liquid output syntax, CSS/JS compatibility, or npm.cmd run lint:theme.
---

# Check Theme Architecture

Use this skill for project-level architecture and static compatibility validation. Shopify Theme Check remains the platform authority for schema validity, parser-blocking scripts, and other built-in theme rules. This skill supplements Theme Check with a small set of low-false-positive project contracts.

## Command Families

- `npm.cmd run lint:theme` — slim generic architecture rules only.
- `npm.cmd run lint:liquid-syntax` — strict Liquid output parsing guard beyond ordinary Theme Check usage.
- `npm.cmd run lint:compat` — first-party CSS, JS, and embedded Liquid `{% stylesheet %}` / `{% javascript %}` compatibility checks.
- `npm.cmd run lint:compat:embedded` — embedded Liquid block scan; this is part of `lint:compat`, not `lint:theme`.
- `npm.cmd run scan:compat` — rebuild Tailwind output, then run all compatibility checks.
- `npm.cmd run test:theme-architecture` — focused fixture tests for the scripts above.
- `npm.cmd run lint` — aggregate gate that includes the commands above when a broader check is requested.

## What `lint:theme` Covers

1. Do not `assign` or `capture` over protected Shopify Liquid runtime names.
2. Static `role="tab"` elements must include `aria-selected` and `aria-controls` (`aria-*`, `:*`, or `x-bind:*` forms).
3. SVG `<text textLength>` must not contain nested `<tspan>` nodes.

## What This Skill Does Not Enforce Yet

Rules tied to undecided JS/CSS implementation architecture — such as specific Components, Alpine, HTTP, SectionRefresher, typography token, or CSS layer conventions — are intentionally not part of the current validator. `AGENTS.md` still governs those implementation rules separately.

## When To Run

- After Liquid changes that may shadow protected runtime names, tab markup, or SVG text rendering.
- After embedded stylesheet/javascript block changes: run `lint:compat`.
- After Tailwind source changes: run `scan:compat`.
- Do not auto-fix merchant-owned configuration or content while resolving lint failures.

## Reporting

Report failures by file, line, and command family. If a finding is pre-existing, say so and classify it as a warning or follow-up according to `AGENTS.md`.
