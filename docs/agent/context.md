# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; durable contracts live in `AGENTS.md`, the matching reference, code, or configuration.

Last updated: 2026-10-13.

## SK-1: the design-to-delivery procedure as one short reference

**Status:** direction accepted by the user on 2026-10-13 (option A on the board). Recorded by the coordinator. **Authorized by the user on 2026-10-13**; executed by the coordinator in the same session.

**Outcome:** a theme started from this repository finds, in one short reference, the steps from a design to its settings and default preset: each step's input and output, who decides, and where the result lands in the chain `docs/references/style-system/css-architecture.md` already describes. The document adds no tool, skill, value, role name or step name.

**Review tier:** Ask (agent rules: a reference, `AGENTS.md`, `docs/project.md`).

**Branch:** `backport/agent-layer`. No commit unless the user asks.

**Dependencies:** none. The `design.md` format statement is checked against its primary source at execution time (see acceptance check 4).

### Implementation surface

1. `docs/references/style-system/design-to-delivery.md` (new), at most about 80 lines, in this order:
   - **Purpose and status:** what the procedure is for, and one sentence that it has not been run end to end and that the first theme to run it corrects this file.
   - **Principle:** a design gives intent (which elements, their order, their relative weight); values come from the theme's own scales, chosen by the user.
   - **Steps**, each with input, output and who decides:
     1. Reference: the user gives the design input (screenshots, reference sites, a statement of intent).
     2. Design language: a tracked `docs/design/design.md` in the open DESIGN.md format, settled between the user and the coordinator.
     3. Mapping: every value in `design.md` is mapped to a place the chain already has (typography settings, colour schemes, page width and margin, motion). What has no place is listed as a gap, and each gap is decided: a new setting or token (an architecture batch), or component CSS owned by one section.
     4. Values: the user chooses the values; agents do not pick them.
     5. Preset: the chosen values become setting defaults in `config/settings_schema.json` and the default preset in `config/settings_data.json`. The second is merchant-owned configuration and needs its own authorization in the plan.
     6. Build: sections and blocks consume tokens and tier or scheme classes under `lint:theme`; anything outside the chain is a named exception in the plan.
     7. Verify and accept: a browser pass at widths the plan names, then the user's acceptance.
   - **What this procedure does not fix:** the tool that produces a design, any skill, the scale values, and the names of roles a theme adds.
2. `AGENTS.md`, Task Routing: one line routing "starting a theme's design, `design.md`, mapping design values to settings and the preset" to the new reference.
3. `docs/project.md`, Status, "Settled": the clause "no separate feature definition-of-done or design-to-code standard, because each plan's acceptance checks carry the standard" is changed so that it keeps "no separate feature definition-of-done" and names the new reference as the design-to-delivery procedure, with acceptance checks still carried by each plan.
4. `README.md`, "Start a derived theme": one bullet pointing to the new reference.
5. This file and `docs/agent/board.md`.

**Forbidden:** every theme file (`assets/`, `blocks/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`, `tailwind/`), validators, `package.json`, workflows, any other reference, any file not listed, and any write to `../my-theme-1`.

### Acceptance checks

1. `git status --short` lists only surface files; state the count from the command.
2. The new reference has all seven steps, each with input, output and decider, and the status sentence. `wc -l` gives its length; it is at most about 80 lines.
3. The new reference names no tool or skill for producing a design, no value (no colour, size or duration literal), and nothing from `../my-theme-1` (no batch id, section name or token name of that theme). Show the `grep` commands used.
4. The statement about the DESIGN.md format (its name, where it is published, and the parts the reference relies on) is checked against the format's primary source at execution time; the record names the source and the date. If the source cannot be reached, the reference says only "the open DESIGN.md format" and the record says so.
5. Every path the new reference cites exists, or is a path the procedure creates and is marked as such: `npm.cmd run lint:doc-paths` passes.
6. `git diff -- AGENTS.md` shows the one routing line; `git diff -- docs/project.md` shows the one changed clause; `git diff -- README.md` shows the one bullet.
7. `npm.cmd run doctor:agent` exits 0; `npx.cmd prettier --check` passes on every changed file; `git diff --check` is clean.
8. Independent review (Ask) reports PASS.

### SK-1: executed

Executed by the coordinator on 2026-10-13 on branch `backport/agent-layer` (HEAD `6afa81b`). Nothing committed.

**Acceptance checks (command, result):**

1. `git status --short`: 6 lines: `AGENTS.md`, `README.md`, `docs/project.md`, `docs/agent/board.md`, `docs/agent/context.md` modified; `docs/references/style-system/design-to-delivery.md` new. All surface files.
2. The reference has the seven steps as one table with Input, Output and "Who decides" columns, and the status sentence. `wc -l`: 59 lines.
3. `grep -n -i -E` on the reference, each with no match (exit 1): tools and skills (`stitch|figma|refero|ui-ux|taste|playwright|frontend-design|review-animations|chrome|lighthouse`); values (`#[0-9a-fA-F]{3,8}\b|[0-9.]+(px|rem|em|ms|s)\b|rgb\(`); the derived theme (`my-theme-1|ceylune|6-[A-Z][0-9]|BP-[0-9]|step-(xs|s|m)|section-frame`).
4. DESIGN.md format: checked on 2026-10-13 against `https://github.com/google-labs-code/design.md` (read through a web fetch that summarises the page): Apache-2.0; the specification calls itself alpha; front matter keys `version`, `name`, `description`, `omitted`, `colors`, `typography`, `rounded`, `spacing`, `components`; sections Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts, any of which may be omitted; unknown sections are preserved. The reference states only these.
5. `npm.cmd run lint:doc-paths`: "Doc path lint passed." The one path the procedure creates (`docs/design/design.md`) carries the `doc-paths: ignore` marker on its line.
6. `git diff --stat -- AGENTS.md docs/project.md README.md`: 1 insertion; 1 insertion and 1 deletion; 1 insertion.
7. `npm.cmd run doctor:agent`: exit 0. `npx.cmd prettier --check` on the six changed files: pass. `git diff --check`: exit 0.
8. Pending: independent review (Ask).

**Deviations and notes:**

- The format's front matter also has `description` and `omitted`, which the plan did not list; the reference names only the keys it relies on.
- Unverified: the procedure itself. It has not been run; the reference says so.

## SK-1: independent review, round 1

External Verifier session, 2026-10-13, read-only. The report was given in chat; its evidence is summarised here.

**Verdict: FAIL**, one finding; every other acceptance check passed.

- **Finding, medium impact.** The reference listed the motion tokens among the places a value maps to, and step 5 wrote all chosen values into setting defaults and the preset. `config/settings_schema.json` has no motion setting; the motion durations and easings are defined directly in `snippets/css-variables.liquid`. So a motion value cannot be written into the preset, and "the theme's values live in the preset" did not cover it. `docs/references/architecture/motion-architecture.md` also limits merchant-facing motion settings to policy. The procedure must separate preset values from code-owned tokens and say when the latter need an architecture batch.

**Proven by the Verifier:** scope (5 modified files, 1 new reference); 59 lines; seven steps with input, output and decider; the status sentence; no tool, skill, value or derived-theme name; the typography settings, color schemes, page width and margin, and motion tokens exist; `config/settings_data.json` is merchant-owned per `AGENTS.md`. Read directly from the upstream specification and licence: Apache-2.0, alpha, the front matter keys, the order of the eight sections, unknown sections preserved. The three single-line diffs (`git diff --numstat`: 1/0, 1/1, 1/0) and the routing line. `lint:doc-paths`, `doctor:agent`, Prettier on the six files and `git diff --check` pass.

**Not proven:** that the reference contradicts no other reference (the finding is a counter-example); the procedure itself, which has not been run.

**Correction (coordinator, 2026-10-13), inside the surface, the reference only:**

- Step 3's note now names two kinds of place: settings-backed (typography settings, color schemes, page width and margin) and code-owned tokens (the motion durations and easings in `snippets/css-variables.liquid`). A code-owned token changes through a code batch, not the preset; making it a merchant setting is an architecture batch within the policy limit of the motion reference.
- Step 5's input and note say that only settings-backed values are written there.
- The DESIGN.md paragraph says settings-backed values live in the preset and code-owned token values in `snippets/css-variables.liquid`.
- Checked by the coordinator: `settings.page_width` and `settings.page_margin` feed `--page-width` and `--page-margin`; the `--motion-*` properties are literals in that snippet (`grep -n "settings\.\|motion" snippets/css-variables.liquid`).
- After the correction: `wc -l` 62 lines; the three `grep` sets of acceptance check 3 still match nothing; `npm.cmd run lint:doc-paths`, `npx.cmd prettier --check` on the reference and this file, and `git diff --check` pass.

## SK-1: independent review, round 2

External Verifier session, 2026-10-13, read-only, limited to the corrected passages.

**Verdict: PASS.** No new defect.

- The corrected passages separate settings-backed values from code-owned tokens, and say that a code-owned token changes through a code batch and becomes a merchant setting only through an architecture batch within the motion policy.
- The code agrees: `config/settings_schema.json` has 7 groups, 38 entries and no motion setting; in `snippets/css-variables.liquid` typography, color schemes, page width and margin read settings, and the motion durations and easings are defined directly.
- No other place is misclassified. The font-size literals are fallbacks for a missing setting. `--header-height` is a runtime-measured fallback that `assets/base.js` updates, so it is not a design scale to name.
- `git status --short`: the same six files; `git diff --numstat`: 1/0 `AGENTS.md`, 1/0 `README.md`, 1/1 `docs/project.md`.
- The three scans match nothing; the reference has 62 lines; `lint:doc-paths`, `doctor:agent`, Prettier on the six files and `git diff --check` pass.
- The round 1 section above matches the round 1 report.

**Not verified:** the procedure end to end; the reference records that state.

**Accepted by the user on 2026-10-13 (step 8).** Open: commit and clear this file when the user asks (step 9).
