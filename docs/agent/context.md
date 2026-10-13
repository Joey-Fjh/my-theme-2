# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-14.

## SK-3: the design source in the procedure, and a baseline design.md

**Status:** direction accepted by the user on 2026-10-14 (Refero and Stitch for now; a design draft is read for its values; this repository ships a baseline `design.md`). Recorded by the coordinator. **Authorized by the user on 2026-10-14, review tier set to Show; executed by the coordinator in the same session.**

**Outcome:** the design-to-delivery reference says where a theme's design comes from and that the design draft's values are used, and a theme started from this repository finds a baseline `design.md` that describes the neutral defaults, to be replaced or supplemented from the design draft.

**Why the principle changes (user, 2026-10-14):** "a design gives intent, never values" was a rule for the derived theme, whose implementation already existed and whose design drafts were not reliable for values. A theme made from this repository starts from the draft.

**Review tier:** Ask by the triggers (a reference is an agent rule). The user may set another tier when authorizing.

**Branch:** `backport/agent-layer`. No commit unless the user asks.

**Dependencies:** none. Acceptance check 4 runs the format's own linter through `npx`, which downloads it for that run and adds nothing to `package.json`; without network access the check is recorded as not run.

### Implementation surface

1. `docs/references/style-system/design-to-delivery.md`:
   - **Principle:** the design draft is the basis. Its values are mapped into the chain: a value with a place replaces the default there; a value without a place is a gap, decided as today (a new setting or token in its own batch, or component CSS). The user still approves the result.
   - **Steps 1 and 2:** the current default sources, marked provisional and not yet run end to end: Refero for references; Stitch as the design agent that produces the design draft and its DESIGN.md; the user's inspiration sites for motion and ideas, with the note that React component libraries among them are motion references only and their code is not used (`AGENTS.md` excludes React).
   - **The DESIGN.md format section:** the format's command-line tool and what each command is for in this procedure: `lint` (structure, token references, contrast), `diff` (what a design draft replaces or adds against the baseline), `export` in the Tailwind v4 form as an aid for writing tokens, never pasted over `tailwind/tailwind.input.css`.
   - **What is not verified:** whether Stitch accepts an existing DESIGN.md as a constraint, and the cost and limits of the Stitch and Refero MCP servers. No MCP server is added to this repository in this batch.
2. `docs/design/design.md` (new): the baseline in the DESIGN.md format, written from the code and naming where each value lives: the colour schemes of `config/settings_data.json` as shipped, the typography settings' defaults and the type steps, the space scale, the breakpoints, the page width and margin defaults, the motion durations and easings. Sections the baseline has nothing to say about (Elevation, Shapes, Components beyond what exists) are listed as omitted or state the neutral default. No value is invented: each comes from a file, and the record names the file per group.
3. `docs/references/style-system/design-to-delivery.md`, step 2 note: the file exists here as the baseline; the `doc-paths: ignore` marker on that line is removed.
4. `README.md`, "Start a derived theme": the existing design-to-delivery bullet names the baseline file.
5. This file and `docs/agent/board.md`.

**Forbidden:** every theme file, validators, `package.json`, the MCP configurations, any other reference, any file not listed, and any write to `../my-theme-1`.

### Acceptance checks

1. `git status --short` lists only surface files; state the count from the command.
2. Every value in `docs/design/design.md` is found in the file the record names for it. The record gives one `git grep` or `node -e` command per group (colours, typography, spacing, breakpoints, page frame, motion) and its output.
3. `docs/design/design.md` has the format's front matter keys it uses and its `##` sections in the specification's order; unknown sections come after them.
4. `npx --yes @google/design.md lint docs/design/design.md` exits 0, or its findings are listed and each is either fixed or explained. If the package cannot be downloaded, the check is recorded as not run with the error text.
5. The reference names no batch id and nothing of `../my-theme-1`; it marks the sources as provisional and lists what is not verified.
6. `npm.cmd run lint:doc-paths`, `npm.cmd run doctor:agent`, `npx.cmd prettier --check` on every changed file and `git diff --check` pass. `docs/design/design.md` is tracked and not ignored (`git check-ignore` prints nothing for it).
7. Review per the tier set at authorization.

### SK-3: executed

Executed by the coordinator on 2026-10-14. Nothing committed.

**Changed:** `docs/references/style-system/design-to-delivery.md` (Principle; steps 1, 2, 3 and 4 of the table; the sources note; the command-line tool; the last list), `docs/design/design.md` (new), `README.md` (one sentence added to the existing bullet), and the two record files.

**Acceptance checks (command, result):**

1. `git status --short`: 5 entries, all surface files (`docs/design/` is the new file's directory).
2. Values in `docs/design/design.md`, each group read from the code:
    - **Colours:** a `node -e` script that parses `config/settings_data.json` and prints `current.color_schemes`: `scheme-1` `#1b2900` / `#d5ff83`, `scheme-2` `#f1f1f1` / `#263d29`, success `#ecfdf5` / `#065f46`, error `#fef2f2` / `#991b1b`. `grep -n page_canvas_color_scheme layout/theme.liquid`: the default canvas is `scheme-2`.
    - **Typography settings:** a `node -e` script over `config/settings_schema.json`: both font pickers `inter_n4`; `heading_weight` `700`; `heading_line_height` 1.2; `heading_letter_spacing` `-0.01em`; `body_font_size` 16; `body_font_size_mobile` 16; `body_line_height` 1.6; `body_letter_spacing` `0em`; `heading_scale` 100.
    - **Type steps:** `grep -nE "@utility (title|copy)-" -A3 tailwind/tailwind.typography.css` for the step of each utility; the sizes recomputed with `node -e` as 16 × 1.2ⁿ and 16 × 1.25ⁿ (the ratios in `snippets/css-variables.liquid`), matching the table.
    - **Spacing and breakpoints:** `grep -nE "--(breakpoint|spacing)" tailwind/tailwind.input.css`: the ten `clamp()` steps whose ends are 0.6 and 1 times the multiplier in `rem` on the 62.5% root, the four aliases, and 48 / 64 / 80rem.
    - **Page frame:** `page_width` 1600 and `page_margin` 10 in `config/settings_data.json`; setting defaults 1200 and 20 in the schema.
    - **Motion and shadows:** `grep -nE "--(alpha|motion)" snippets/css-variables.liquid` and the three `--shadow-*` roles in `tailwind/tailwind.input.css`.
3. The front matter uses `version`, `name`, `description`, `omitted`, `colors`, `typography`, `spacing`; the `##` sections are Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts, then Motion as an unknown section. Checked against the specification text (`docs/spec.md` of the format's repository, read through a web fetch that summarises it).
4. **Not run in effect.** `npx.cmd --yes @google/design.md lint docs/design/design.md` exits 0 with no output, and so do the same command on a deliberately broken file and `--help`. The tool produces nothing on this machine, so its exit code proves nothing. The file is not linter-checked.
5. The reference names no batch id and nothing of the derived theme; the sources are marked provisional with a "Not verified" entry.
6. `npm.cmd run lint:doc-paths` passed; `npm.cmd run doctor:agent` exit 0; `npx.cmd prettier --check` on the three changed documents passed; `git diff --check` clean; `git check-ignore docs/design/design.md` prints nothing (exit 1), so the file is tracked.

**Notes for the user:**

- The two colour schemes this repository ships are a dark green with lime text and a light grey with dark green text. They are in `config/settings_data.json`, which is merchant-owned; the baseline documents them as they are. They look like a brand palette rather than a neutral default, which matters for "only skeleton content"; changing them needs explicit authorization.
- The shipped preset sets the page width to 1600px and the margin to 10px, which differ from the setting defaults (1200px and 20px).

**Accepted by the user on 2026-10-14 (Show).**
