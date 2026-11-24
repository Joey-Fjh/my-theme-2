# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in [the board](board.md), and accepted, unscheduled work lives in [the backlog](backlog.md).

Last updated: 2026-11-24.

## Batch AL-1 — Option B page frame, homepage right rail, Header, and Hero

**Status:** Executed. Independent Ask review returned FAIL. Waiting for correction, correction review and user visual acceptance. The user authorized a work-in-progress commit and push to `wip/al-1` on 2026-11-24.

**Outcome:** Implement the shared four-track Option B page frame in `assets/base.css`, the homepage-only continuous right ruler rail in `layout/theme.liquid` and `snippets/page-rail.liquid`, code-owned mono/light-italic font tokens in `snippets/css-variables.liquid`, the refactored Header in `sections/header.liquid`, and the new signature homepage Hero in `sections/hero.liquid` with translated schema and fallback copy, without touching merchant-owned JSON files.

**Dependencies:** Resolved (mapping approved and Batch AL-1 explicitly authorized by the user on 2026-11-24; target Batch AL-2 preset pair recorded as `1400 / 32` in backlog).

**Implementation surface:** `assets/base.css`, `layout/theme.liquid`, `snippets/css-variables.liquid`, `snippets/page-rail.liquid` (new), `sections/header.liquid`, `sections/hero.liquid` (new), `locales/en.default.json`, `locales/en.default.schema.json`, `assets/tailwind.output.css` (rebuilt via `npm.cmd run build:tw`), and agent records (`docs/agent/board.md`, `docs/agent/backlog.md`, `docs/agent/context.md`). Forbidden in this batch: `config/settings_data.json`, `sections/header-group.json`, `templates/index.json`.

**Review tier:** Ask, because this batch modifies Liquid markup and schema (`layout/theme.liquid`, `snippets/css-variables.liquid`, `snippets/page-rail.liquid`, `sections/header.liquid`, `sections/hero.liquid`) and adds locale keys.

**Estimate:** One focused implementation and validation pass (~45–60 minutes).

**Checkpoint:** Stop and report after completing the code implementation, rebuilding `assets/tailwind.output.css`, running `review-animations` if motion is touched, passing all static checks (`lint:theme`, `lint:i18n`, `lint:liquid-syntax`, `scan:compat`, `test:theme-check`, `lint:records`), and verifying rendered layout/monotonicity evidence, ready for independent Ask review and user visual acceptance before starting Batch AL-2.

**Bar:** Must pass every static validator with zero errors, keep non-home templates on a 0px-rail symmetric frame, align Header and Hero left/right content edges within 1px, maintain strict monotonicity (0 backward shrink of content or portrait width) across 2-column widths under both default and varied `page_width`/`page_margin` settings, keep Header menu switching decoupled from Hero sizing/stacking, and keep merchant-owned JSON files untouched. Branded preset color/font values and homepage JSON section wiring remain accepted residue for Batch AL-2.

### Acceptance checks

- `assets/base.css` defines the shared four-track page frame (`--page-rail-width`, `--page-outer-inset`, `--page-inset-start`, `--page-inset-end`, `--page-grid-columns`), with `--page-rail-width: 0px` on non-home pages and available-space monotonic ramp on `:root[data-page-rail='true']`.
- `layout/theme.liquid` activates `data-page-rail="true"` on `<html>` when `request.page_type == 'index'` and renders `snippets/page-rail.liquid` (`aria-hidden="true"`, covering Header + `<main>` inside `.page-shell`), with progressive numeral/tick degradation via `@container page-rail`.
- `sections/header.liquid` and `sections/hero.liquid` share identical `.section` content edges and switch independently via `@container` (`header-frame` / `hero-frame`), with Header mobile menu operable by keyboard/Escape and Hero stacking Copy -> CTA -> Circular Portrait on narrow containers.
- Hero uses `snippets/image.liquid` (`aspect_ratio: 'square'`, eager, `fetchpriority: 'high'`), consumes `--color-accent-background` for cobalt accents, omits empty optional fields/CTA cleanly, and keeps all visible copy/schema/ARIA in locale files.
- `npm.cmd run build:tw`, `npm.cmd run lint:theme`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run scan:compat`, `npm.cmd run test:theme-check`, `npm.cmd run lint:records`, and `git diff --check` pass; rendered layout verification covers 375, 639/640, 768, 859/860, 904–1024, and 1440px.

### Execution log

- Implemented the four-track Option B page frame in `assets/base.css` using `:root[data-page-rail='true']` (so `--page-outer-inset`, `--page-inset-end`, and `--page-grid-columns` on `:root` resolve the active rail width cleanly across all descendants), `body > .page-shell` with `margin-block-end: auto` so `.page-rail` terminates at the bottom of `<main>`, and `.section` using `padding-inline-start` / `padding-inline-end`.
- Updated `layout/theme.liquid` to emit `data-page-rail="true"` on `<html>` when `request.page_type == 'index'`, wrap `header-group` + `<main>` + conditional `snippets/page-rail.liquid` inside `.page-shell`, and keep `footer-group` below `.page-shell`.
- Added `snippets/css-variables.liquid` tokens for optional light-italic heading font face (`heading_font_light` / `heading_font_light_italic` via `font_modify`), `--font-heading-light-weight` (falls back to `settings.heading_weight`), and `--font-mono-family`.
- Created `snippets/page-rail.liquid` (`aria-hidden="true"`, static architectural marks `00..80`, progressive degradation via `@container page-rail` at `4.99rem`, `3.79rem`, `2.79rem`, and `0.99rem`).
- Refactored `sections/header.liquid` onto `.header__frame` (`container-name: header-frame`, `border-inline` + `border-block-end`), preserving schema IDs (`color_scheme` default `scheme-2`, `menu`) and JSON-LD, using `size: 'md'` icons, cobalt accent dot on active cart via `--color-accent-background` (empty dot via `--color-indicator`), existing `header-dropdown-menu`, and progressive `<details>` mobile drawer wired to the existing `dropdown` Alpine module (`@container header-frame (max-width: 80.99rem)`), with country/language selectors in the mobile drawer.
- Created `sections/hero.liquid` onto `.hero__frame` (`container-name: hero-frame`), fluid 2-column grid (`--hero-portrait-w: clamp(28.6rem, calc(65.5cqi - 9.6rem), 69.2rem)`), vertical divider hidden at `@container hero-frame (max-width: 75.99rem)`, single-column stack at `@container hero-frame (max-width: 59.99rem)` (Copy -> CTA -> Circular Portrait), `snippets/image.liquid` (`aspect_ratio: 'square'`, `loading: 'eager'`, `decoding: 'sync'`, `fetchpriority: 'high'`), cobalt arcs via `--color-accent-background`, 4 crosshairs, optional technical notes, and full locale keys in `locales/en.default.json` and `locales/en.default.schema.json`.
- Confirmed `git status --short` leaves merchant-owned files (`config/settings_data.json`, `sections/header-group.json`, `templates/index.json`) untouched. Note: Batch AL-1 changes coexist in the working tree alongside the previously parked `Batch AXIS-DRAFT` docs/CI changes per explicit user authorization on 2026-11-24.
- **`review-animations` audit:** Read `.agents/skills/review-animations/SKILL.md` and `STANDARDS.md`. Motion touched is limited to hover `color`, `background-color`, and `border-color` transitions in `sections/header.liquid` and `sections/hero.liquid`, all gated by `@media (hover: hover) and (pointer: fine)`, using `var(--motion-duration-fast)` (`250ms` < `300ms`) and custom ease-out `cubic-bezier(0.22, 1, 0.36, 1)`, with zero layout-triggering properties, zero `transition: all`, and reduced-motion immediate state change (`0.01ms`) honored. Verdict: **Approve** (0 findings).
- **Static validation (final post-edit run):**
  - `npm.cmd run build:tw`: Done in 82ms (`assets/tailwind.output.css` regenerated).
  - `npm.cmd run lint:theme`: Theme architecture lint passed.
  - `npm.cmd run lint:i18n`: i18n lint passed; Unused locale key lint passed.
  - `npm.cmd run lint:liquid-syntax`: Liquid syntax lint passed.
  - `npm.cmd run scan:compat`: stylelint passed; eslint passed; Embedded compatibility lint passed (11 stylesheet blocks, 0 javascript blocks).
  - `npm.cmd run lint:records`: passed (board topics: 0, pending migration lines: 0).
  - `npm.cmd run test:theme-check`: 67 files inspected with no offenses found.
  - `npm.cmd run scan:contrast`: 0 failing pair(s).
  - `git diff --check`: clean.
  - `npm.cmd exec -- prettier --check` on the 8 edited/created theme files reported style warnings in 4 files (`assets/base.css`, `snippets/page-rail.liquid`, `sections/header.liquid`, `sections/hero.liquid`); `--write` was not run per `AGENTS.md` ("Do not run rewriting formatters unless the user asks").
- **Rendered real-CSS Playwright sweep (`scratch/verify-al1.mjs`):** Loaded the real compiled `assets/tailwind.output.css` plus extracted `{% stylesheet %}` blocks from `snippets/image.liquid`, `snippets/page-rail.liquid`, `sections/header.liquid`, and `sections/hero.liquid` in headless Chrome across 5 scenarios (`home-1400-32`, `home-1200-32`, `home-1200-20`, `home-1400-48`, `nonhome-1400-32`), 158 viewports each (790 checks total), reporting `issues: 0`:
  - `leftDelta: 0` and `rightDelta: 0` across all widths; zero horizontal overflow; zero backward shrink of `contentW` or `portraitW` across all 2-column widths in all 5 scenarios.
  - Under `home-1400-32`: `375px` (`contentW 328`, `portraitW 277.2`, CTA above portrait), `639/640px` (`contentW 582.7/583.7`, 1-col, `railW 0`), `768px` (`contentW 707.1`, 2-col, `navDesktop false`, `railW 0`), `859/860px` (`contentW 794.9/795.9`, 2-col, `navDesktop false`, `railW 0`), `904px` (`contentW 835.7`, `railW 2.6`, `navDesktop true`), `964px` (`contentW 864.6`, `railW 31.6`), `1024px` (`contentW 894.1`, `railW 60`, `portraitW 488.3`), `1440px` (`contentW 1301`, `railW 60`, `portraitW 692`).
  - Under `nonhome-1400-32`: `railW: 0` at every width (`1440px` `contentW: 1361`).
  - Visual review of refreshed screenshots (`1440`, `1024`, `768`, `375px`) confirmed three post-implementation fixes: `.page-rail` ends cleanly at the bottom border of Hero, Header icons at `size: 'md'` render crisp, and `ARCHITECTURAL` clears the portrait rim at `1024px`.
- **Unproven until Batch AL-2 / live store session:** Live `shopify theme dev` preview and `npm.cmd run test:layout` against the live storefront (intentionally deferred because `config/settings_data.json` and `templates/index.json` are outside Batch AL-1 scope).

### Independent review handoff

The 2026-11-24 review returned **FAIL**. Resume with these findings before the correction review:

1. Restore desktop country and language selectors. The current selectors live only in the mobile drawer.
2. Preserve third-level menu destinations in the mobile drawer. The desktop menu already renders them.
3. Prevent Header overlap with supported logo sizes and longer navigation labels. A 300px logo overlapped Search at a 390px viewport. A five-item menu with longer labels also overlapped Search at 1024px in the reviewer fixture.
4. Make the Hero `sizes` declaration cover the rendered width throughout the supported layout settings. At 1280px with `page_width: 2000`, `page_margin: 10` and overlay scrollbars, the image measured 674px and the declaration supplied 665.6px.
5. Use a loaded body-font weight for the Hero CTA when body and heading families differ.
6. Resolve the Prettier check in `assets/base.css`, `snippets/page-rail.liquid`, `sections/header.liquid` and `sections/hero.liquid`.

The reviewer independently verified the merchant-owned files, Header schema IDs, both JSON-LD blocks, the non-home zero-width rail, and baseline alignment and monotonicity across 790 fixture checks. Theme Check inspected 67 files with no offenses. The live Shopify preview and user visual acceptance are pending. The original design and accepted Option B rail-transition images are the design references for resuming. The external static prototype is independent of the theme runtime.

Before the WIP checkpoint, `npm.cmd run build:tw` completed in 90ms with an identical generated CSS hash. `npm.cmd run lint:records` and `git diff --check` passed. The checkpoint includes the pending AXIS-DRAFT changes and preserves all six AL-1 findings.

### Independent review prompt

```text
You are the Verifier for axis-layr-theme (d:\fjh\shopify\my-theme-2). Read AGENTS.md, then .agents/roles/verifier.md, and follow that role: read-only, no edits, no builds, formatters or server starts, no commits, no subagents.

Batch under review: "Batch AL-1 — Option B page frame, homepage right rail, Header, and Hero". The plan, the user's authorization, the acceptance checks, and the implementer's validation claims are in docs/agent/context.md. Do not inherit those claims; re-run everything yourself.

Scope: uncommitted working-tree changes (`git diff`) for Batch AL-1 (note: Batch AXIS-DRAFT doc/CI changes coexist in the same working tree per user authorization on 2026-11-24). Implementation surface for AL-1: assets/base.css, layout/theme.liquid, snippets/css-variables.liquid, snippets/page-rail.liquid, sections/header.liquid, sections/hero.liquid, locales/en.default.json, locales/en.default.schema.json, assets/tailwind.output.css, and record files (docs/agent/board.md, docs/agent/backlog.md, docs/agent/context.md). Confirm config/settings_data.json, sections/header-group.json, and templates/index.json are untouched.

Review: full.

Verify:
1. Each acceptance check in docs/agent/context.md, with fresh evidence, judged against the plan's Bar.
2. Schema ID and JSON-LD preservation in sections/header.liquid, Layer-1/Layer-2 token and font-weight compliance, :root[data-page-rail='true'] rail monotonicity formula and non-home 0px isolation, Hero image snippet contract and empty-setting handling, review-animations record completeness, and zero changes to merchant-owned JSON files.

Run: npm.cmd run lint:theme, npm.cmd run lint:i18n, npm.cmd run lint:liquid-syntax, npm.cmd run lint:compat, npm.cmd run lint:records, npm.cmd run test:theme-check, npm.cmd run scan:contrast, npm.cmd exec -- prettier --check assets/base.css layout/theme.liquid snippets/css-variables.liquid snippets/page-rail.liquid sections/header.liquid sections/hero.liquid locales/en.default.json locales/en.default.schema.json, git diff --check, git status --short.

Output per verifier.md: findings first by impact (file:line, defect, evidence), then proven / unproven, commands run with their output, and a verdict: PASS or FAIL. FAIL only on evidence of a violated requirement, project rule or correctness problem; the rest are notes.
```

## Batch AXIS-DRAFT — Design intake and repository identity

**Status:** Executed, including the follow-up documentation cleanup and proposal update. Awaiting independent review of the project identity, changed references and Lighthouse configuration, and user review of the design draft, page frame and global settings.

**Outcome:** Identify the derived theme correctly and provide a Shopify design draft and an implementable Hero scope for review.

**Implementation surface:** `DESIGN.md`, `docs/project.md`, agent records, `README.md`, package identity metadata and `.github/workflows/lighthouse.yml`. The user authorized design drafting and updates to non-theme documentation, configuration and CI on 2026-11-24. The follow-up authorizes correction of inherited references under `docs/references/` while continuing the existing CSS, Liquid, JS and Theme Block architecture.

**Review tier:** Ask for `docs/project.md`, the changed references and Lighthouse workflow wiring. A verifier in a separate session can assess the diff and commands below.

**Estimate:** One documentation and repository configuration pass.

**Checkpoint:** Hand off for review while the page frame, global settings and first Header and Hero scopes are on the work board.

**Bar:** Match identity to the user-confirmed project and Git root, ground the design in the accepted prototype, preserve CI checks and threshold values, and keep the change outside theme implementation and merchant-owned settings.

### Acceptance checks

- Compare the design draft against the desktop comparison, tablet layout and mobile preview. Check the four planned reference widths from the static prototype.
- Run `designmd lint DESIGN.md`, `npm.cmd run lint:records`, `npm.cmd run lint:doc-paths`, `npm.cmd run doctor:agent`, `npm.cmd run test:ci-contract` and `git diff --check`.
- Inspect the diff for scope. Check the package and lockfile identity metadata. Confirm the Lighthouse job retains its status name and score thresholds, with optional product and collection handles coming from repository variables.
- Compare the follow-up reference changes with the current design file, Container and Group, product and footer, cart bootstrap and Lighthouse workflow. Verify that the documentation identifies both block models and reflects the existing theme architecture.

### Execution evidence

- Read the accepted prototype QA, desktop comparison and mobile screenshot. Captured the homepage in Chromium from the existing static build at 375, 768, 1024 and 1440 CSS px. The portrait loaded at all four widths. Document width matched the viewport and the Hero was stacked at 375px and split at the other three widths. These previews are design evidence.
- Used the Shopify and frontend-design skills to check the theme design context and keep the selected visual direction. Verified the obsolete STATUS-1 entry belonged to the mother-template checkout. Its separate review remains outside this repository.
- `designmd lint` using `@google/design.md@0.4.0` reported zero errors and one `missing-primary` warning. The design slot template uses scheme IDs and roles for color names. The six draft text, accent, feedback and control-edge pairs measured 7.29:1 to 18.27:1.
- `lint:records`, `lint:doc-paths`, `test:ci-contract` (18 tests), Prettier on the changed workflow and package descriptors, and `git diff --check` passed. A parsed workflow comparison confirmed that the changes are limited to the inherited repository condition and the two fixture inputs. Package identity matches the lockfile.
- `doctor:agent` exits 1 on this Windows checkout. `CLAUDE.md` and `.claude/skills` appear as plain files locally, and Git records both with symlink mode `120000`. The check reported only these two issues. GitHub Lighthouse runtime and its repository settings still need verification after publication.
- Follow-up cleanup corrected the draft and mapping description, the CSS capability status, the runtime's cart startup rationale, motion wording, the Theme Block inventory and Lighthouse behavior. Shopify Dev MCP confirmed the distinctions between section blocks, dynamic and static Theme Blocks, and targeted versus open block slots. Current source confirms Container and Group use Theme Blocks, while product and footer retain section blocks.
- The follow-up changes are Markdown only. `lint:records`, `lint:doc-paths` and `git diff --check` passed. `doctor:agent` reported the same local symlink checkout issue. The inherited `theme_info` name and support links in `config/settings_schema.json` belong to a future theme metadata scope.
- The user asked to review the frame and global settings first, then start with Header and Hero, with carousel and lower sections deferred. The work board now records candidate values against the existing settings and the two section scopes. Rechecked `lint:records`, `lint:doc-paths` and `git diff --check`. The diff contains no Liquid, theme CSS, assets, theme configuration or template changes.

### Independent review prompt

Review the AXIS-DRAFT working tree as the Verifier in `D:\fjh\shopify\my-theme-2`. Read `AGENTS.md`, `.agents/roles/verifier.md` and this record. Compare the diff with the implementation surface and checks above. Verify the project identity against the initial commit and remote, the design and responsive claims against the accepted prototype, the reference corrections against current theme source, and the Lighthouse inputs and required checks against the action and ruleset. Reproduce the local checks and distinguish checkout issues and live CI from the proposed changes. Report findings and PASS or FAIL. The page frame and settings direction is the current decision. Header and Hero implementation scopes follow.
