# Design To Delivery

This reference is the procedure a theme follows from a design to its settings, its default preset, and its built sections. `AGENTS.md` remains the rule source. Read it when a theme starts its design, drafts its design language, or maps design values to settings.

**Status:** this procedure has not been run end to end. The first theme to run it corrects this file through its own rule-change batch.

## Principle

The design draft is the basis of a theme. Its values are read and mapped into the chain: a value that has a place replaces the default there; a value that has no place is a gap, decided as step 3 describes. This repository ships a baseline, `docs/design/design.md`, that describes the neutral defaults; a theme replaces or supplements it from its design draft. The user approves the result.

Agents map the draft; they do not invent values the draft does not give, and they do not paste a value past the chain.

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

| Step | Input | Output | Who decides |
| --- | --- | --- | --- |
| 1. Reference | The user's brief, with the references and inspiration the user chooses | The input, kept where the theme's plan names | User |
| 2. Design draft | The brief and the references | The design draft, and its DESIGN.md saved over the baseline design-language file | User judges the draft; coordinator files it |
| 3. Mapping | The design-language file, compared with the baseline | A table: each value mapped to a place the chain already has (replace) or listed as a gap (supplement) | Coordinator proposes; user decides each gap |
| 4. Values | The mapping table | The value for each mapped place, taken from the draft | User approves |
| 5. Preset | The chosen values for settings-backed places | Setting defaults in `config/settings_schema.json` and the default preset in `config/settings_data.json` | User authorizes; see the note below |
| 6. Build | The preset and the design-language file | Sections and blocks that consume tokens and tier or scheme classes | Implementer, under `lint:theme` |
| 7. Verify and accept | The built pages | A browser pass at the widths the plan names, then acceptance | Verifier, then user |

Notes on single steps:

- **Steps 1 and 2, sources.** The design is made before the theme starts, outside this repository, with the tools the user chooses; this procedure names none. React component libraries among the references are motion references only; their code is not used, because `AGENTS.md` excludes React.
- **Step 2.** The file lives at `docs/design/design.md`. Here it is the baseline; in a theme it is that theme's design language.
- **Step 3.** The chain has two kinds of place today, and the mapping table marks which kind each value goes to:
    - **Settings-backed:** the typography settings (`body_font_size`, `body_font_size_mobile`, `heading_scale`, and the font pickers), the color schemes, and the page width and margin. Their values are written in step 5. The type scale uses those body sizes as its step-0 bases.
    - **Code-owned tokens:** the space scale (`--spacing-step-*` in `tailwind/tailwind.input.css`), the type-scale ratio and `--font-body-scale` (a constant `1` in `snippets/css-variables.liquid`), the colour roles (formulas on the scheme colours), and the motion durations and easings. `snippets/css-variables.liquid` defines the type steps, the roles' per-scheme values, and the motion tokens directly; no setting controls the ratio, the role formulas, or the motion values. Changing one is a code change in its own batch, not a preset change. Turning one into a merchant setting is an architecture batch, and `docs/references/architecture/motion-architecture.md` limits motion settings to policy, not low-level detail.
    - A value with no place of either kind is a gap. Each gap is decided one at a time: a new setting or token, which is an architecture batch of its own, or component CSS owned by one section.
- **Step 5.** Only settings-backed values are written here. `config/settings_data.json` is merchant-owned configuration; writing the default preset needs explicit authorization in that batch's plan.
- **Step 6.** Anything a section needs outside the chain is a named exception in the plan, not a silent literal.
- **Each step is a batch** under the Batch SOP in `AGENTS.md`, with its own acceptance checks. Steps may be combined when the plan says so.

## The DESIGN.md format

The design-language file follows the open DESIGN.md format published at `https://github.com/google-labs-code/design.md` (Apache 2.0; the specification calls itself alpha; checked 2026-10-13). Read the current specification before drafting, because it is still changing. The parts this procedure relies on:

- YAML front matter that names the design and lists its `colors`, `typography`, `rounded`, `spacing`, and `components`.
- `##` sections in the specification's order: Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts. Any may be omitted.
- Unknown sections are preserved, so a theme adds its own after them (for example component states, responsive behavior, motion).

The format has a command-line tool, run without installing it (`npx -y -p @google/design.md designmd <command>`; the package's other command name, `design.md`, does not run on Windows):

- `lint` checks the structure, the token references and text contrast.
- `diff` compares two files token by token. Comparing a design draft's file with the baseline shows what the draft replaces and what it adds.
- `export` writes the tokens in other forms, among them a Tailwind v4 `@theme` block. Use its output as an aid when writing tokens; never paste it over `tailwind/tailwind.input.css`, whose resets, roles and fluid formulas it does not know.

The front matter documents the design's values. It is not a token source: the theme's settings-backed values live in the preset, and its code-owned token values live in the files step 3 names (`tailwind/tailwind.input.css` and `snippets/css-variables.liquid`).

## What this procedure does not fix

- The sources and tools of steps 1 and 2: the user chooses them for each theme.
- Any skill. `AGENTS.md` (Agent Skills) names the vendored skills and their triggers.
- The values of any scale.
- The names of roles, tiers, or steps a theme adds.
