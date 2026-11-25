# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in [the board](board.md), and accepted, unscheduled work lives in [the backlog](backlog.md).

Last updated: 2026-11-25.

## Batch AL-6 — Homepage Hero and left ruler visual refinement

**Status:** Executed; independent correction review PASS. Awaiting user visual acceptance at 375, 768, 1024 and 1440 CSS px.

**Outcome:** Bring the homepage Hero circle scale and position, right-side dual whitespace, two-column divider and title crossing, unified thin lines and crosshairs, and left architectural ruler (`0 mm` visible inside Header height, ~30px major tick pitch) closer to the accepted 1440px prototype (`docs/design/axis-home-prototype-1440.png`) while keeping AL-5's 1400px page width, 16px margin, `scheme-1`, cobalt accent, and non-home layout intact.

**Dependencies:** Resolved. On 2026-11-25 the user explicitly authorized this refinement batch on top of the AL-5 working tree, scoped to homepage Hero and left ruler only. The board's `Desktop Header and Hero visual fidelity` topic leaves the board into this batch.

**Implementation surface:** `sections/hero.liquid`, `snippets/page-rail.liquid`, `assets/page-rail.js`, `locales/en.default.json`, `assets/base.css` (`.page-rail` z-index only), `assets/tailwind.output.css` (rebuilt via `npm.cmd run build:tw`), and agent records (`docs/agent/board.md`, `docs/agent/context.md`). Header markup/styles, merchant JSON (`config/settings_data.json`, section groups, templates), and non-home pages remain untouched.

**Review tier:** Ask (modifies Liquid markup in `sections/hero.liquid` and `snippets/page-rail.liquid`, plus `assets/base.css` and `assets/tailwind.output.css`).

**Estimate:** 2–4 hours including live Shopify preview before/after comparisons.

**Checkpoint:** Stop after delivering before/after screenshots, measured geometry values, changed files, validator outputs, and unverified items for independent Ask review and user visual acceptance, keeping all changes in the local working tree without committing.

**Bar:** At 1440 CSS px against the AL-5 baseline with identical content, the circle expands leftward into the 780–800px target range with its top hugging the Header bottom rule while keeping every Header control visible and clickable (`0` blocked controls); inner photo-to-ring gap (~8px) and outer ring-to-frame right gap (~41px) are both clearly preserved; the vertical divider sits near 37–38% of the content frame so `ARCHITECTURAL` naturally crosses the divider and stays legible; thin lines and crosshairs share a unified 1px Hero stroke (`--hero-line-color`), junction crosshairs align to the divider's top and bottom intersections, circle crosshairs sit on geometric `50%`/`0%`/`100%` anchors, and the divider plus junctions hide when stacking; the left ruler shows `0 mm` inside the Header height at ~30px major tick pitch, degrades cleanly without right-edge clipping when narrowing, and never clips its last label at page bottom; 1024, 768, and 375 CSS px plus a non-home Header check show zero horizontal overflow, zero title clipping, and all static and live `test:layout` checks pass.

### Acceptance checks

- Capture before/after screenshots at 1440 CSS px on the live Shopify dev preview (`http://127.0.0.1:9292`) with identical content, and record circle diameter, ring-top to Header-bottom gap, inner/outer right gaps, divider percentage, and ruler major-tick pitch alongside `docs/design/axis-home-prototype-1440.png`.
- Capture 1024, 768, and 375 CSS px homepage screenshots and a non-home Header check (`/collections/all` at 1440px), verifying zero horizontal overflow, zero blocked Header controls, zero title clipping, aligned lines/crosshairs, stacked divider/junction removal, and clean ruler narrowing degradation (`1440..880px`).
- Confirm Hero `image` snippet `sizes` and `widths` reflect the larger circle diameter (`788px` at desktop, `widths` up to `1600`).
- Run `npm.cmd run build:tw`, `npm.cmd run lint:theme`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run scan:compat` (includes `lint:compat`), `npm.cmd run test:theme-check`, `npm.cmd run lint:records`, `npm.cmd exec -- prettier --check sections/hero.liquid snippets/page-rail.liquid assets/base.css`, `git diff --check`, and live `npm.cmd run test:layout`.

### Execution log

- **Hero (`sections/hero.liquid`):**
  - Updated `--hero-portrait-w` from `clamp(28.6rem, calc(65.5cqi - 9.6rem), 69.2rem)` to `clamp(28.6rem, 59.2cqi, 79.2rem)`, `--hero-pad-r` to `clamp(var(--spacing-step-m), 3.1cqi, 4.4rem)`, `--hero-pad-y` to `clamp(0.2rem, 0.3cqi, 0.4rem)`, and `--hero-gap` to `clamp(var(--spacing-step-xs), 0.9cqi, 1.2rem)`. Updated Hero `image` snippet `widths` to include `1600` and `sizes` to `(min-width: 1400px) 788px, (min-width: 680px) 56vw, (min-width: 420px) 340px, 85vw`.
  - Tuned `.hero__copy` vertical padding (`clamp(var(--spacing-step-l), 3.6cqi, var(--spacing-step-3xl))`), `.hero__title` `max-width: 122%` and tightened `line-height` (`max(0.92, calc(var(--font-heading-line-height) * 0.78))`), and `.hero__brand` (`1.12em`, `margin-block-end: 0.02em`).
  - Unified Hero thin lines and crosshairs via `--hero-line-color: var(--color-line)` on `.hero__frame`, `.hero__grid::before`, `.hero__dash`, `.hero__portrait-ring`, and `.hero__crosshair`. Shared `--hero-divider-x` across the vertical divider, `.hero__junction--top`, and `.hero__junction--bottom`, placing the junction rules after `.hero__crosshair` so `transform` is no longer overridden. Centered circle crosshairs at exact geometric anchors (`50%`/`50%`, `100%`/`50%`, `50%`/`0`, `50%`/`100%`). Moved divider and junction hiding to `@container hero-frame (max-width: 59.99rem)` (stacked breakpoint).
- **Left ruler (`snippets/page-rail.liquid`, `assets/base.css`):**
  - Raised `.page-rail` `z-index` in `assets/base.css` from `1` to `var(--z-layer-popover)` (30, above `.header`'s `--z-layer-dropdown: 20`) while keeping `pointer-events: none` and `[rail-start]..[rail-end]` bounds outside `.header__frame`, making `0 mm` visible inside the Header height.
  - Changed the first mark in `snippets/page-rail.liquid` to `0<span class="page-rail__unit"> mm</span>`, set `--rail-origin: 1.8rem` and `--rail-step: 3rem` (`30px` major tick pitch, `15px` mid, `3px` minor), and hid `.page-rail__unit` under `@container page-rail (max-width: 3.79rem)` so narrowing to `960px` (`railW = 32.5px`) drops ` mm` cleanly without right-edge clipping.
- **Live Shopify dev preview measurements (`http://127.0.0.1:9292`, dev theme `#190866522186`, `scratch/capture-al6.mjs`, screenshots `al6-{before,after}-home-{1440,1024,768,375}.png` and `al6-{before,after}-collection-1440.png`):**
  - **1440 CSS px (before → after):** content frame `1333px` → `1333px` (Header/Hero edge delta `0px`); circle diameter `692px` → `787.9px`; ring-top to Header-bottom `30px` → `4.0px`; inner right gap (photo to ring) `8.0px` → `8.0px`; outer right gap (ring to frame) `30.0px` → `41.2px`; divider `45.01%` (`676px`) → `37.27%` (`572.8px`); `ARCHITECTURAL` divider crossing `-63.9px` → `+39.3px`; bottom junction `(676, 799)` (25px off `heroB=824`) → `(572.8, 867.4)` (within `0.5px` of `heroB=867.9`); top junction added at `(572.8, 70.5)` (`hdrB=71`, upper arm intentionally sits behind `.header` so Header dropdowns remain on top); circle top crosshair `(1011.2, 101)` → `(972.8, 75)` (exact geometric center); ruler major pitch `60px` → `30px`, `0 mm` visible in Header (`y=11.9..24.1`), last mark `290` unclipped (`bottom=894.1 <= railB=919.9`); blocked Header controls `0/7`, `overflowX: false`, `titleClip: 0`, `errors: 0`.
  - **1024 CSS px:** frame `917px`, ring `541.7px`, ring-top to Header-bottom `2.7px`, inner gap `6.2px`, outer gap `28.4px`, divider `37.28%` (`417.8px`), `ARCHITECTURAL` crosses by `+27.0px`, `jTop=(417.8, 58.5)`, `jBot=(417.8, 606.6)` (`hdrB=59`, `heroB=607.1`), ruler `0 mm` visible at `30px` pitch (`last=290`, unclipped), `0/7` blocked Header controls, `overflowX: false`, `titleClip: 0`.
  - **768 CSS px:** frame `721px`, ring `425.6px`, ring-top to Header-bottom `4.5px`, inner gap `5.0px`, outer gap `22.3px`, divider `37.28%` (`284.8px`), `ARCHITECTURAL` crosses by `+21.3px`, `jTop=(284.8, 58.5)`, `jBot=(284.8, 494.3)` (`hdrB=59`, `heroB=494.8`), `0/4` blocked Header controls, `overflowX: false`, `titleClip: 0`.
  - **375 CSS px (stacked):** frame `328px`, ring `277.2px`, divider and both junctions hidden (`visible: false`), inner gap `5.0px`, outer gap `24.4px`, `0/4` blocked Header controls, `overflowX: false`, `titleClip: 0`.
  - **Ruler narrowing sweep (`1440..880px`):** `1440/1024` (`railW=60`, `0 mm`, `r=60.2/60.9 <= 76`); `960` (`railW=32.5`, degrades to `0`, `r=33.3 <= 48.5`, `8` visible labels, `last=280` unclipped); `920` (`railW=12.5`, ticks only); `900` (`railW=2.5`, hidden); `880` (`railW=0`).
  - **Non-home Header (`/collections/all` at 1440px):** `status=200`, `hasPageRailAttr: false`, `hasRailEl: false`, `headerFrame.w=1393px`, `scrollWidth=1425/1440` (no overflow).
- **Validation:**
  - `npm.cmd run build:tw`: Done in 80ms (`assets/tailwind.output.css` rebuilt).
  - `npm.cmd run lint:theme`: Theme architecture lint passed.
  - `npm.cmd run lint:liquid-syntax`: Liquid syntax lint passed.
  - `npm.cmd run scan:compat` (`build:tw`, `stylelint`, `eslint`, `lint-embedded-compat`): passed (12 stylesheet blocks, 0 javascript blocks).
  - `npm.cmd run test:theme-check`: 67 files inspected with no offenses found.
  - `npm.cmd exec -- prettier --check sections/hero.liquid snippets/page-rail.liquid assets/base.css`: All matched files use Prettier code style.
  - `npm.cmd run test:layout` (live preview): all 9 pages 0 issues across all categories, `New issues (not in baseline): 0`, wall time `154217ms`.
  - `npm.cmd run lint:records` and `git diff --check`: passed.
- **Unverified items:**
  - Visual check with the final photographic eyewear portrait (current dev theme uses Shopify's `lifestyle-1` placeholder SVG, so `ARCHITECTURAL` crossing readability over a real portrait photo still needs visual confirmation once real media is uploaded).
  - Visual check with a configured Hero CTA link enabled (`cta_link` is currently blank in the dev theme, matching the AL-5 baseline).
  - Theme Editor live preview interaction of the updated Hero/ruler geometry.

#### Correction pass — i18n, ruler inline-fit, RTL crosshairs, and Hero `sizes` (2026-11-25)

Addressed the four findings from the initial AL-6 independent review without changing the accepted first-screen composition:

1. **Ruler unit i18n (`locales/en.default.json`, `snippets/page-rail.liquid`):**
   - **Reproduced:** `npm.cmd run lint:i18n` failed with `snippets/page-rail.liquid:17: Hardcoded visible text "mm" should use the | t filter.`
   - **Fix:** Added `general.ruler.unit_mm` (`"mm"`) in `locales/en.default.json` and rendered `{{ 'general.ruler.unit_mm' | t }}` inside `.page-rail__unit`.
   - **Verified:** `npm.cmd run lint:i18n` passed (`i18n lint passed. Unused locale key lint passed.`). `1440px` and `1024px` display `0 mm`.
2. **Ruler narrowing clip (`assets/page-rail.js`, `snippets/page-rail.liquid`):**
   - **Reproduced:** At `971px` (`railW = 38px`), `0 mm` overflowed `.page-rail` by `+1.30px`; at `--font-body-scale: 1.35`, `971px` overflowed by `+10.16px` and `980px` by `+5.63px`.
   - **Fix:** Added `.page-rail__track[data-rail-hide-unit] .page-rail__unit { display: none; }` in `snippets/page-rail.liquid` and measured `firstNumber.getBoundingClientRect()` against `rail.left`/`rail.right` inside `assets/page-rail.js` `sync()` before computing `visibleCount`.
   - **Verified:** 1px sweep across `960–980px`: `maxOverflowRightPx = -0.20px` (0 failures; `<= 973px` hides unit cleanly to `0`, `>= 974px` shows `0 mm` inside bounds). At `--font-body-scale: 1.35`, `965/971/980px` hide the unit cleanly (`-15.45 / -15.45 / -19.97px`) while `1024/1440px` keep `0 mm` (`-5.75 / -6.59px`). `1440px` and `1024px` preserve `0 mm`, `30px` major tick pitch, and unclipped last label `290`.
3. **RTL crosshair alignment (`sections/hero.liquid`):**
   - **Reproduced:** Under `dir="rtl"` at `1440px`, `junctionTop` / `junctionBottom` were off by `-23.5px`, and circle `center` / `top` / `bottom` / `edge` were off by `-24.0px`.
   - **Fix:** Introduced `--hero-crosshair-x: -50%` on `.hero__crosshair`, flipped to `50%` under `[dir='rtl'] .hero__crosshair`, and used `var(--hero-crosshair-x)` in `.hero__crosshair`, `.hero__junction--top`, and `.hero__junction--bottom`.
   - **Verified (LTR and RTL at 1440, 1024, 768, 375px):** Every visible crosshair (`junctionTop`, `junctionBottom`, `center`, `top`, `bottom`, `edge`) is within `<= 0.5px` (`|dx| <= 0.5`, `|dy| <= 0.5`, circle marks `<= 0.01px`). At `375px` (stacked), the vertical divider and both junctions remain hidden in both LTR and RTL.
4. **Hero image `sizes` (`sections/hero.liquid`):**
   - **Reproduced:** At `679px` (default `1400/16` with scrollbar), `.hero__portrait-media` rendered at `360.95px` against declared `340px` (`+20.95px` violation); at `650px`, `343.78px` vs `340px`.
   - **Fix:** Updated `sizes` to `(min-width: 1360px) 792px, (min-width: 620px) 58vw, (min-width: 420px) 340px, 85vw`.
   - **Verified (`scratch/verify-al6-fix.mjs`):** `0` violations across the full `620–680px` 1px sweep plus settings matrix (`page_width` 1000/1400/2000 × `page_margin` 10/16/100 × scrollbar on/off): e.g. `679px` default `360.95 <= 393.82px`; `679px` `2000/10` no-scrollbar `376.94 <= 393.82px`; `622px` `2000/10` no-scrollbar `343.19 <= 360.76px`; `1440px` max `774 <= 792px`.
- **Regression & validation:**
  - Regression captures (`al6-fix-home-{1440,1024,768,375}.png`): 1440px frame `1333px`, ring `787.9px`, ring-top to Header-bottom `4.0px`, inner/outer right gaps `8.0px` / `41.3px`, divider `37.27%`, `ARCHITECTURAL` crosses by `+39.3px`, `overflowX: false` at all 4 widths.
  - `npm.cmd run build:tw` (79ms), `npm.cmd run lint:i18n`, `npm.cmd run lint:theme`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:compat` (`stylelint`, `eslint`, `lint-embedded-compat`), `npm.cmd run test:theme-check` (67 files, 0 offenses), `npm.cmd exec -- prettier --check sections/hero.liquid snippets/page-rail.liquid assets/page-rail.js locales/en.default.json`, `npm.cmd run lint:records`, and `git diff --check` all passed.
  - Live `npm.cmd run test:layout` (`http://127.0.0.1:9292`): all 9 pages 0 issues across all categories, `New issues (not in baseline): 0`, wall time `154252ms`.

#### Follow-up — Per-number inline overflow hiding on narrowing ruler (2026-11-25)

- **Reproduced (`scratch/al6-rail-repro.json`):** At `951px` (`railW = 28px`, 16px body, LTR & RTL), `120 / 160 / 200 / 240 / 280` overflowed `.page-rail` by `+2.00px`. With 22px body (`--type-step--2` scaled per `snippets/css-variables.liquid`), `951px` overflowed by `+6.41px` and `960px` (`railW = 32.5px`) overflowed by `+1.97px`.
- **Fix (`assets/page-rail.js`, `snippets/page-rail.liquid`):** Added `.page-rail__num[data-rail-overflow] { visibility: hidden; }` in `snippets/page-rail.liquid` (keeping mark height and tick positions intact while preserving `getBoundingClientRect()` for automatic recovery) and checked every `.page-rail__num` against `rail.left` and `rail.right` inside `assets/page-rail.js` `sync()`.
- **Verified (`scratch/al6-rail-verify.json`):**
  - 1px sweep across `940–1024px` × LTR/RTL × 16px/22px (340 width-config checks): **`0` failures, `worstClip = 0.00px`**.
  - `951px` (`railW = 28px`, 16px & 22px, LTR & RTL): visible `[0, 40, 80]` (`maxOv = -4.33px` @ 16px, `-1.39px` @ 22px); hidden `[120, 160, 200, 240, 280]`.
  - `960px` (`railW = 32.5px`, LTR & RTL): at 16px all `[0, 40, 80, 120, 160, 200, 240, 280]` visible (`maxOv = -2.52px`, 0 hidden); at 22px visible `[0, 40, 80]` (`maxOv = -5.86px`), hidden `[120, 160, 200, 240, 280]`.
  - `971px` (`railW = 38px`, 16px & 22px, LTR & RTL): `0 mm` → `0`, all `[0, 20, ..., 280]` visible (`maxOv = -5.03px` @ 16px, `-0.48px` @ 22px).
  - Narrow-then-widen recovery (`1440 → 951 → 880 → 1440`, LTR & RTL): `exactRestore: true` — all 30 labels (`0 mm`, `10`, ..., `290`), `30px` tick pitch, and exact mark top positions restore cleanly.
  - `1024px` & `1440px` (LTR & RTL): `0 mm` visible, `30px` major tick pitch, last label `290` unclipped (`ovB = -5.71px` @ 1024px/16px, `-4.06px` @ 1024px/22px; `clippedCount: 0`).
- **Validation:** `npm.cmd run build:tw` (98ms), `npm.cmd run lint:theme`, `npm.cmd run lint:compat` (`stylelint`, `eslint`, `lint-embedded-compat`), `npm.cmd run lint:i18n`, `npm.cmd exec -- prettier --check assets/page-rail.js snippets/page-rail.liquid`, `npm.cmd run lint:records`, and `git diff --check` passed. Live `npm.cmd run test:layout` passed across all 9 pages (`New issues (not in baseline): 0`, wall time `153522ms`; an earlier run concurrent with the sweep script hit one transient `/cart` runtime error that cleared cleanly on standalone rerun).

#### Independent review and real-image preview (2026-11-25)

- The correction review verified the locale key, crosshair alignment within 0.5px in LTR and RTL, and no Hero image `sizes` under-declaration across 1,314 Chrome fixture checks. It found that subsequent ruler labels could still clip.
- The targeted ruler follow-up review passed. Chrome fixtures using current theme CSS and the ruler script found no visible label clipping across 1,020 width, direction, font size and page height combinations, with exact restoration in all 12 narrowing and widening cycles. Static validators passed. Port 9292 was unreachable during independent review. The implementation's live layout report recorded nine pages with zero issues.
- The user's real-image screenshot showed the circular crop filled and both right-side gaps visible. The final letter of `ARCHITECTURAL` and the focus annotation lost contrast over the photo. The screenshot still showed the CTA-absent state. These are pending visual checks for the user.

### Independent review prompt

```text
Review Batch AL-6 (correction pass + per-number ruler overflow follow-up) in Joey-Fjh/my-theme-2 (D:\fjh\shopify\my-theme-2) as a read-only Verifier. Read AGENTS.md, docs/project.md, .agents/roles/verifier.md, and the Batch AL-6 plan and correction entries in docs/agent/context.md.

Scope: working-tree changes belonging to AL-6 (`sections/hero.liquid`, `snippets/page-rail.liquid`, `assets/page-rail.js`, `locales/en.default.json`, `assets/base.css`, `assets/tailwind.output.css`, and the AL-6 updates in `docs/agent/board.md` and `docs/agent/context.md`). Other working-tree changes belong to AL-5.

Review: correction.

Verify:
1. Ruler unit i18n: `general.ruler.unit_mm` in `locales/en.default.json` used via `| t` in `snippets/page-rail.liquid`; `npm.cmd run lint:i18n` passes; `1440px`/`1024px` show `0 mm`.
2. Ruler narrowing fit & per-number overflow: 1px sweep across `940–1024px` in LTR and RTL at 16px and 22px body font sizes shows `0` clipped labels (both inline and bottom); overflowing numbers hide via `data-rail-overflow` (`visibility: hidden`) while keeping tick/mark positions intact; narrowing then widening (`1440 -> 951 -> 880 -> 1440`) restores all 30 labels (`0 mm`..`290`) and `30px` pitch; `1024px`/`1440px` keep `0 mm`, `30px` pitch, and unclipped last label.
3. LTR & RTL crosshair alignment at `1440`, `1024`, `768`, `375px`: `--hero-crosshair-x` flips under `[dir='rtl']`; all visible crosshairs align within <= 1px of their anchors; stacked `375px` hides divider and junctions.
4. Hero image `sizes`: `(min-width: 1360px) 792px, (min-width: 620px) 58vw, (min-width: 420px) 340px, 85vw` has `0` violations where actual `.hero__portrait-media` width exceeds declared `sizes` across `620–680px` and supported `page_width`/`page_margin`/scrollbar combinations.
5. Preserved AL-6 first-screen composition and passing `lint:i18n`, `lint:theme`, `lint:liquid-syntax`, `lint:compat`, `test:theme-check`, `lint:records`, Prettier, `git diff --check`, and live `test:layout` (when dev preview is running).

Output per verifier.md: findings first by impact (file:line, defect, evidence), then proven / unproven, commands run with their output, and verdict PASS or FAIL. Do not edit files or record visual acceptance on the user's behalf.
```

## Batch AL-5 — Scheme ID migration and first-screen settings

**Status:** Executed; independent static review PASS. Awaiting user visual acceptance at 375, 768, 1024 and 1440 CSS px. The development preview was unavailable during independent review.

**Outcome:** The only light scheme is `scheme-1` with the original colors unchanged. Page width, page margin and the scheme accent pair move toward the accepted 1440px prototype (`docs/design/axis-home-prototype-1440.png`) using existing settings only.

**Dependencies:** Resolved. On 2026-11-25 the user authorized this batch and its merchant-owned changes: the `config/settings_data.json` values below, the `color_scheme` references in `sections/header-group.json`, `sections/footer-group.json` and `templates/*.json`, the section schema defaults, the gift card scheme class and `DESIGN.md`. This instruction is the basis for the `Merchant-Change:` trailer if a commit is requested. The board's settings preview option leaves the board with this plan.

**Implementation surface:** `config/settings_data.json` (rename `current.color_schemes.scheme-2` to `scheme-1`; `page_width` 1200 → 1400; `page_margin` 20 → 16; `accent_background_color` `#2320ED`; `accent_foreground_color` `#FCFCFC`), `sections/header-group.json`, `sections/footer-group.json`, `templates/{article,blog,cart,collection,index,list-collections,search}.json`, `color_scheme` schema defaults in 16 `sections/*.liquid` files, `templates/gift_card.liquid` (body class), `DESIGN.md` (current scheme ID and token names) and agent records. Earlier batch records keep the IDs they used. All other settings, colors, fonts, media, menus, links and layout are unchanged.

**Review tier:** Ask (changes Liquid schema and markup, renames a setting ID).

**Estimate:** 30–45 minutes including preview capture.

**Checkpoint:** Stop after the migration, settings, preview before/after evidence and validators, and hand off for independent review and user visual acceptance without committing.

**Bar:** Exactly one scheme `scheme-1` whose eight original values are identical to the old `scheme-2`, plus the two accent values. No active `scheme-2` reference in config, sections, templates, snippets, blocks or layout. Header and Hero frames align within 1px at all four widths with no horizontal overflow, header collision or title clipping. Validators pass. The remaining prototype differences (circle size cap, circle to header rule gap, divider position, type hierarchy) are accepted residue for the Header and Hero refinement topic. Judged on the current dev-theme content.

### Acceptance checks

- A parsed comparison of `config/settings_data.json` against `HEAD` shows only the scheme key rename, the two accent additions, and the `page_width` and `page_margin` values.
- `git grep "scheme-2"` outside the agent records and generated CSS finds only the generic example in a `snippets/css-variables.liquid` comment.
- Shopify dev preview before/after at 1440 CSS px with the same content records content-frame width, Header to Hero edge alignment and the ring arc color. Checks at 375, 768 and 1024 cover horizontal overflow, header collisions and title clipping. A collection page and the gift card preview load `color-scheme-1`.
- `npm.cmd run lint:theme`, `npm.cmd run scan:contrast`, `npm.cmd run test:theme-check`, `npm.cmd run lint:records`, `git diff --check` and `npm.cmd run test:layout` pass.

### Execution log

- Migrated the scheme key and added the accent pair in `config/settings_data.json`, and set `page_width` 1400 and `page_margin` 16. Replaced `"scheme-2"` with `"scheme-1"` in 16 section schema defaults, 2 section groups and 7 JSON templates, and changed the gift card body class. The diff is 26 one-line replacements. Renamed the nine `DESIGN.md` color tokens and the two prose mentions to `scheme-1`.
- Parsed comparison against `HEAD`: schemes `['scheme-2']` → `['scheme-1']`. The only scheme differences are `accent_background_color` (unset → `#2320ED`) and `accent_foreground_color` (unset → `#FCFCFC`). The only global differences are `page_width` 1200 → 1400 and `page_margin` 20 → 16. The remaining `scheme-2` text is the generic comment in `snippets/css-variables.liquid`.
- Shopify dev preview at `http://127.0.0.1:9292` (dev theme `#190866522186`) through headless Chrome with `playwright-core` (`scratch/capture-al5.mjs` in the conversation artifacts). Screenshots `al5-{before,after}-home-{375,768,1024,1440}.png`, `al5-{before,after}-collection-1440.png` and `al5-{before,after}-giftcard-1440.png`.
  - 1440 before: frame 172.5–1312.5, 1140px wide; Header and Hero left and right deltas 0. The ring is 649.4px with 27.3px between the Header bottom and the ring top. Arcs `rgb(17, 24, 39)`.
  - 1440 after: frame 76–1409, 1333px wide (prototype about 1300px); deltas 0; the ring is 692px (Hero size cap) with a 30px gap. Arcs `rgb(35, 32, 237)` (`#2320ED`) and accent foreground `252, 252, 252`. Root `--page-width: 140rem`, `--page-margin: 1.6rem`.
  - 1024 after: frame 917px (911.3 before); 768 after: 721px (717.5); 375: 328px, unchanged. Header and Hero deltas were 0 at every width. `scrollWidth` equals the viewport minus the 15px scrollbar at every width, with no horizontal overflow. Brand, nav and tools boxes did not overlap, no title element was clipped, the title stayed inside the viewport and there were no page errors. The crude nav-link pairwise box metric reports 12 (1024) and 11 (1440) both before and after, likely from submenu links included by the selector. The screenshots show no visible collision.
  - `/collections/all`: Header, menus, main and Footer use `color-scheme-1`, with a white body and accent `35, 32, 237`. Gift card preview `/gift_cards/65116504138/preview`: body `gift-card-page color-scheme-1`, white background, status 200.
- `lint:theme` passed. `scan:contrast`: `scheme-1` text 17.74, muted 9.44, subtle 7.06, success 7.29, error 7.60, with 0 failing pairs. The report does not cover the accent pair. Calculated: `#FCFCFC` on `#2320ED` 8.18:1; `#2320ED` on `#FFFFFF` 8.40:1. `test:theme-check`: 67 files, no offenses. `git diff --check` was clean.
- `lint:records` first failed on the stale `Last updated` line in `docs/agent/backlog.md`, then passed after that date was bumped. `test:layout` against the live preview: all 9 pages had 0 issues in every category, with 0 new issues, in a 153159ms wall time.
- Not verified: theme editor scheme picker display and saved section state in the Shopify admin. Live store settings outside the dev theme. Other accent consumers (focus rings, links and selected states) on product, cart and search pages beyond the static token check.
- Independent review (2026-11-25) confirmed the only scheme is `scheme-1`, the eight original scheme values are intact, and the ID migration covers 16 section defaults, two section groups, seven JSON templates and the gift card page. Theme architecture, contrast, Theme Check, records, Prettier and diff checks passed. The independent review could inspect the captures and saved layout report. The dev server at port 9292 was unavailable for a new run.

### Independent review prompt

```text
Review Batch AL-5 in Joey-Fjh/my-theme-2 (D:\fjh\shopify\my-theme-2) as a read-only Verifier. Read AGENTS.md, docs/project.md, .agents/roles/verifier.md and the AL-5 plan in docs/agent/context.md. Review the working-tree diff against HEAD. AL-5 owns config/settings_data.json, sections/header-group.json, sections/footer-group.json, templates/*.json, the color_scheme defaults in sections/*.liquid, templates/gift_card.liquid, DESIGN.md and the agent records. Earlier batch records keep their historical IDs.

Verify that scheme-1 is the only scheme and keeps the eight original scheme-2 values exactly. The only other settings changes should be accent_background_color #2320ED, accent_foreground_color #FCFCFC, page_width 1400 and page_margin 16. Check that no active scheme-2 reference remains in config, layout, sections, snippets, blocks or templates, and that every schema default names an existing scheme. Confirm DESIGN.md token names match the current ID. Run lint:theme, scan:contrast, test:theme-check, lint:records and git diff --check. If a Shopify dev preview is running, check the homepage at 375, 768, 1024 and 1440 CSS px for Header and Hero edge alignment, overflow, nav collisions, title clipping and cobalt ring arcs. Also confirm that a collection page and the gift card preview load color-scheme-1. Report findings first, then proven and unproven evidence, commands with output, and PASS or FAIL. Do not edit files or record visual acceptance on the user's behalf.
```

## Batch AL-4 — Move desktop localization switcher from Header to Footer

**Status:** Executed; independent correction review PASS. Waiting for authenticated Shopify localization submission verification and user visual acceptance. The development preview returned `401` on the previous submission attempt.

**Outcome:** Remove `.header__utility-bar` (container, border, and vertical space) across all pages using the shared Header; place the desktop country/region and language switchers as compact text controls in the shared Footer's secondary bottom area using existing Shopify localization forms, snippets, and Alpine behavior with unique IDs (`FooterCountry`, `FooterLanguage`) and upward-opening menus so bottom-edge clipping never occurs; retain the narrow-screen Header mobile drawer localization entry using the exact same `80.99rem` container threshold so at least one entry is always available and never duplicated across both home and non-home pages.

**Dependencies:** Resolved (current working tree baseline with AL-1, AL-2, and AL-3 preserved; user explicitly authorized Batch AL-4 as an independent Ask batch on 2026-11-24).

**Implementation surface:** `sections/header.liquid`, `sections/footer.liquid`, `assets/tailwind.output.css` (rebuilt via `npm.cmd run build:tw`), and `docs/agent/context.md`. Shared localization snippets (`snippets/localization-switcher.liquid`, `snippets/country-localization.liquid`, `snippets/language-localization.liquid`), `assets/localization-switcher.js`, ruler rail (`snippets/page-rail.liquid`, `assets/page-rail.js`), Hero (`sections/hero.liquid`), color schemes, and merchant JSON files (`config/settings_data.json`, `sections/header-group.json`, `sections/footer-group.json`, `templates/*.json`) remain untouched.

**Review tier:** Ask (visual and interactive batch modifying Liquid markup in `sections/header.liquid` and `sections/footer.liquid` and removing `.header__utility-bar` markup and `HeaderCountry` / `HeaderLanguage` IDs).

**Estimate:** 30–60 minutes.

**Checkpoint:** Stop and report after removing `.header__utility-bar`, wiring desktop localization into `sections/footer.liquid` with synchronized `80.99rem` container width switching and upward-opening menus, running `review-animations`, rebuilding Tailwind, passing static/compatibility/record/Prettier checks, verifying home and non-home desktop/narrow/threshold fixtures + keyboard/Tab/Escape/focus restoration + live Shopify preview screenshots and `test:layout`, ready for independent Ask review without committing or pushing.

**Bar:** Zero residual `.header__utility-bar` container, divider, or height in Header on both homepage and non-home pages; Header and Footer share identical `80.99rem` content-box container thresholds so across all widths (including 1px threshold steps on home and non-home) exactly one localization surface is visible (Footer on wide, Header drawer on narrow) with zero overlap and zero gap; country and language each render only when more than 1 option exists; unique localization DOM IDs (`FooterCountry`, `FooterLanguage`, `HeaderMobileCountry`, `HeaderMobileLanguage`); Footer menus open upward without bottom-edge or viewport clipping and support mouse, Tab, Escape, outside click, and focus restoration to trigger; ruler, Hero, color schemes, and merchant JSON remain untouched; all static validators and `test:layout` pass with 0 new issues.

### Acceptance checks

- `sections/header.liquid` removes `.header__utility-bar` HTML and styles completely, moves `header-frame` container ownership onto `.header` (`content-box` width = section content width), and preserves mobile drawer localization (`HeaderMobileCountry`, `HeaderMobileLanguage`) at `@container header-frame (max-width: 80.99rem)`.
- `sections/footer.liquid` renders compact desktop localization controls (`FooterCountry`, `FooterLanguage`) in `.footer__bottom` only when `available_countries.size > 1` / `available_languages.size > 1`, hides `.footer__localization` at `@container footer-frame (max-width: 80.99rem)` using identical `content-box` width on `.footer`, and opens `.localization-menu` upward above the trigger (`inset-block-start: auto; inset-block-end: calc(100% + var(--spacing-step-3xs))`) without bottom-edge or viewport clipping.
- Both homepage (`/`) and a non-home page (`/collections/all`) are verified at desktop, narrow, and 1px threshold steps confirming zero Header empty row, exact mutual exclusion (always 1 entry visible, never 0 or 2), usable Footer and drawer menus, and working Tab, Escape, and focus restoration.
- Live Shopify preview screenshots (`al4-live-home-1440.png`, `al4-live-home-1440-footer-open.png`, `al4-live-home-390-drawer.png`, `al4-live-nonhome-1440-footer-open.png`, `al4-live-nonhome-768.png`) and `npm.cmd run test:layout` pass; live `/localization` POST submission after unlocking the storefront preview is verified or recorded as pending if password-gated.
- `npm.cmd run build:tw`, `npm.cmd run lint:theme`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run scan:compat`, `npm.cmd run test:theme-check`, `npm.cmd run lint:records`, `npm.cmd exec -- prettier --check sections/header.liquid sections/footer.liquid`, and `git diff --check` pass.

### Execution log

- **Header (`sections/header.liquid`):** Removed `.header__utility-bar` markup (`HeaderCountry`, `HeaderLanguage`) and all `.header__utility-bar` CSS selectors/media queries completely. Moved `container-type: inline-size; container-name: header-frame;` from `.header__frame` to `.header` (with `position: relative; z-index: var(--z-layer-dropdown)`) so the container `content-box` width matches `<footer class="section footer">` identically (`100% - --page-inset-start - --page-inset-end`) without the 2px `.header__frame` border offset. Retained narrow-screen mobile drawer localization (`HeaderMobileCountry`, `HeaderMobileLanguage`) at `@container header-frame (max-width: 80.99rem)`.
- **Footer (`sections/footer.liquid`):** Added conditional Liquid guards (`localization.available_countries.size > 1`, `localization.available_languages.size > 1`), wrapped copyright and `.footer__localization` (`FooterCountry`, `FooterLanguage`) in `.footer__bottom`, set `container-type: inline-size; container-name: footer-frame; position: relative; z-index: var(--z-layer-dropdown)` on `.footer`, hid `.footer__localization` at `@container footer-frame (max-width: 80.99rem)`, and styled `.footer__localization .localization-switcher .localization-menu` with `(0,3,0)` specificity to open upward (`inset-block-start: auto; inset-block-end: calc(100% + var(--spacing-step-3xs)); max-height: min(24rem, calc(var(--screen-height) - 12rem))`) without modifying shared localization snippets or `assets/localization-switcher.js`.
- **`review-animations` audit:** Read `.agents/skills/review-animations/SKILL.md` and `STANDARDS.md`. Motion changes remove the `.header__utility-bar` hover color transition and add an equivalent color-only hover transition on `.footer__localization .localization-switcher :where(button)` gated by `@media (hover: hover) and (pointer: fine)`, using `var(--motion-duration-fast)` (`< 300ms`) and `var(--motion-ease-default)` (`cubic-bezier(0.22, 1, 0.36, 1)`), with zero `transition: all`, zero layout properties, and `@media (prefers-reduced-motion: reduce)` (`0.01ms`) honored. Verdict: **Approve** (0 findings).
- **Static checks:**
  - `npm.cmd run build:tw`: Done in 71ms (`assets/tailwind.output.css` synced).
  - `npm.cmd run lint:theme`: Theme architecture lint passed.
  - `npm.cmd run lint:i18n`: i18n lint passed; Unused locale key lint passed.
  - `npm.cmd run lint:liquid-syntax`: Liquid syntax lint passed.
  - `npm.cmd run scan:compat`: `build:tw` (63ms), `stylelint`, `eslint`, and `lint-embedded-compat` passed (12 stylesheet blocks, 0 javascript blocks).
  - `npm.cmd run test:theme-check`: 67 files inspected with no offenses found.
  - `npm.cmd exec -- prettier --check sections/header.liquid sections/footer.liquid`: All matched files use Prettier code style!
  - `git diff --check`: clean.
- **Browser fixture verification (`verify-al4-localization.mjs`, headless Chrome via `playwright-core`, `snippets/localization-switcher.liquid` CSS loaded after `sections/header.liquid` and `sections/footer.liquid`, `failuresCount: 0`):**
  - 1px threshold sweeps (`830..930px` + `375 / 390 / 768 / 1024 / 1440px`, 106 widths × 5 configs = 530 checks): `home-1200-20` & `nonhome-1200-20` (`lastNarrow: 856`, `firstWide: 857`), `home-1400-32` & `nonhome-1400-32` (`lastNarrow: 876`, `firstWide: 877`), `home-1000-40` (`lastNarrow: 891`, `firstWide: 892`) — all `bothVisible: 0`, `bothHidden: 0`, `maxHeaderTopGap: 0`, `maxAlignDelta: 0`, `dupIds: 0`.
  - Desktop Footer (`home-1440x900`, `home-1024x768`, `nonhome-1024x500-short`, `nonhome-1440x700-tall` scrolled to bottom): `#FooterCountry` (`menuW: 320`, `menuH: 240`, `Netherlands`/`Luxembourg` 1-line `32px`, `South Georgia...` 2-line `45px`) and `#FooterLanguage` open upward (`opensUpward: true`), stay completely inside viewport (`top/bottom/left/right` all true), first option `elementFromPoint`-clickable, `Tab` steps into options, `Escape` closes and restores focus to trigger.
  - Narrow drawer (`home-390x650`, `nonhome-390x650`): `.footer__localization` hidden, `5` options immediately visible/clickable (`panelBottom: 427.8 <= 650`), `Tab` + `Escape` closes and restores focus to visible `SUMMARY`.
- **Live Shopify dev preview verification (`http://127.0.0.1:9292`, `joey-new-store.myshopify.com`, dev theme `#190832771146`, without `--theme-editor-sync`):**
  - `npm.cmd run test:layout`: **PASS** across all 9 live pages (`home`, `cart`, `search`, `collections`, `collection-all`, `not-found`, `product`, `blog`, `article`, `320..2560px`, `Wall time: 147911ms`, `New issues (not in baseline): 0`).
  - Live probe (`verify-al4-live.mjs`) & visual screenshots (`al4-live-home-1440.png`, `al4-live-home-1440-footer-open.png`, `al4-live-home-390-drawer.png`, `al4-live-nonhome-1440-footer-open.png`, `al4-live-nonhome-768.png`):
    - Both `/` and `/collections/all`: `hasUtilityBar: false`, `hasOldHeaderIds: false`, `headerTopGap: 0`, unique localization IDs (`FooterCountry`, `FooterLanguage`, `HeaderMobileCountry`, `HeaderMobileLanguage`; note pre-existing merchant menu duplicate `HeaderMenu-popular-colors` in untouched `snippets/header-dropdown-menu.liquid`).
    - Exact 1px threshold sweep on both `/` and `/collections/all`: `lastNarrow: 861px`, `firstWide: 862px`, `bothVisible: 0`, `bothHidden: 0`, `maxAlignDelta: 0`.
    - Desktop Footer (`1440px`) on both `/` and `/collections/all`: `#FooterCountry` (`menuW: 220`, `menuH: 76`, `2` options) and `#FooterLanguage` (`2` options) open upward inside viewport, clickable, `Tab` focuses `ChinaCNY ¥`, `Escape` hides menu and restores focus to trigger.
    - Narrow drawer (`390 × 650`) on both `/` and `/collections/all`: `.footer__localization` hidden, `2` options immediately visible/clickable (`panelBottom: 628`), `Tab` + `Escape` restores focus to visible `SUMMARY`.
  - **Pending (storefront password / local proxy `401`):** Submitting `#FooterCountry` emits `POST http://127.0.0.1:9292/localization`, which returns `HTTP 401` on the local Shopify CLI dev proxy, and the direct shareable preview URL redirects to `/password` (`STOREFRONT_PASSWORD` not set locally). End-to-end persistence after unlocking the password-protected Shopify preview remains pending user/unlocked browser verification.

#### Correction pass — RTL Footer menu logical-end alignment (2026-11-24)

The initial AL-4 review reported that under RTL (`dir="rtl"`), `assets/localization-switcher.js` computed `alignEnd = false` near the left viewport edge, causing `snippets/localization-switcher.liquid`'s `inset-inline-start: 0` to expand the Footer menu leftward past the left viewport edge. Fixed strictly in `sections/footer.liquid` without modifying shared localization snippets, `assets/localization-switcher.js`, `sections/header.liquid`, or merchant JSON:

- **Fix (`sections/footer.liquid`):** Added `margin-inline-start: auto` on `.footer__localization` (keeping Footer localization pinned at the logical end of `.footer__bottom` even if the row wraps) and added `inset-inline-start: auto; inset-inline-end: 0;` on `.footer__localization .localization-switcher .localization-menu` (`(0,3,0)` specificity > `(0,2,0)` of `.localization-switcher .localization-menu`). Menus continue opening upward (`inset-block-end: calc(100% + var(--spacing-step-3xs))`) and always align to the trigger's logical end, expanding toward the page interior (leftward in LTR, rightward in RTL).
- **Post-correction static checks:**
  - `npm.cmd run build:tw`: Done in 62ms (`assets/tailwind.output.css` unchanged vs prior AL-4 build).
  - `npm.cmd run lint:theme`: Theme architecture lint passed.
  - `npm.cmd run lint:i18n`: i18n lint passed; Unused locale key lint passed.
  - `npm.cmd run lint:liquid-syntax`: Liquid syntax lint passed.
  - `npm.cmd run scan:compat`: `build:tw` (65ms), `stylelint`, `eslint`, and `lint-embedded-compat` passed (12 stylesheet blocks, 0 javascript blocks).
  - `npm.cmd run test:theme-check`: 67 files inspected with no offenses found.
  - `npm.cmd exec -- prettier --check sections/header.liquid sections/footer.liquid`: All matched files use Prettier code style!
  - `git diff --check`: clean.
- **Post-correction LTR & RTL browser fixture verification (`verify-al4-rtl.mjs`, headless Chrome via `playwright-core`, `snippets/localization-switcher.liquid` CSS loaded after `sections/footer.liquid`, `failuresCount: 0`):**
  - **Desktop matrix (16 checks: `ltr` / `rtl` × `home` / `nonhome` × `1024` / `1440px` × `FooterCountry` / `FooterLanguage`, `vh: 800`, all `opensUpward: true`, `alignedLogicalEnd: true`, `allFourEdgesInViewport: true`, `firstClickable: true`, `Tab` enters menu option, `Escape` hides menu and restores focus to trigger):**
    - `ltr-home-1024` & `ltr-nonhome-1024`: Country `[599.2..919.2, 516.7..756.7]`, Language `[772.9..992.9, 585.8..756.7]` (expands leftward into interior).
    - `ltr-home-1440` & `ltr-nonhome-1440`: Country `[917.1..1237.1, 515.1..755.6]`, Language `[1092.5..1312.5, 583.1..755.6]`.
    - `rtl-home-1024` & `rtl-nonhome-1024`: Country `[89.8..409.8, 516.7..756.7]`, Language `[16.1..236.1, 585.8..756.7]` (expands rightward into interior).
    - `rtl-home-1440` & `rtl-nonhome-1440`: Country `[187.9..507.9, 515.1..755.6]`, Language `[112.5..332.5, 583.1..755.6]`.
  - **Threshold 1px sweep regression (`ltr/rtl × home/nonhome`, `845..875px`):** all 4 combinations `lastNarrow: 856`, `firstWide: 857`, `bothVisible: 0`, `bothHidden: 0`.
  - **Narrow `390 × 650` drawer regression (`ltr/rtl × home/nonhome`):** all 4 combinations `footerHidden: true`, `panelBottom: 427.8`, `visibleClickable: 5`, `Tab` + `Escape` closes menu and restores focus to visible `SUMMARY`.

#### Independent correction review — PASS (recorded 2026-11-25)

- The verifier reproduced 16 desktop menu cases, 8 mobile drawer cases, and 132 one-pixel breakpoint checks with current theme CSS and the existing Alpine behavior. Desktop menus opened upward and inward in LTR and RTL, with a clickable first option and working Tab, Escape, and focus restoration. Each breakpoint case had exactly one visible localization entry. No fixture page errors were reported.
- Read-only reruns of `lint:compat`, `lint:theme`, `lint:i18n`, `lint:liquid-syntax`, `lint:records`, `test:theme-check` (67 files, no offenses), Prettier on Header and Footer, and `git diff --check` passed.
- No Shopify development preview was listening at review time, so the review did not rerun `test:layout`. The earlier nine-page result remains implementation evidence. Authenticated `/localization` submission and persistence, and user visual acceptance, still need verification. The existing duplicate `HeaderMenu-popular-colors` ID is outside AL-4.

### Independent review prompt

```text
You are the Verifier for Joey-Fjh/my-theme-2 (D:\project\shopify_project\my-theme-2). Read AGENTS.md, docs/project.md, .agents/roles/verifier.md, and the Batch AL-4 plan in docs/agent/context.md, and follow the Verifier role: read-only, no edits, no builds, formatters or server starts, no commits, no subagents.

Batch under review: "Batch AL-4 — Move desktop localization switcher from Header to Footer". Do not inherit the implementer's claims; re-run everything yourself.

Scope: working-tree changes belonging to AL-4 (`sections/header.liquid`, `sections/footer.liquid`, `assets/tailwind.output.css`, and `docs/agent/context.md`). Other working-tree changes belong to AL-1, AL-2, and AL-3. Confirm no changes to shared localization snippets/JS, ruler rail, Hero, color schemes, or merchant JSON presets.

Review: correction.

Verify:
1. RTL & LTR Footer country/language menus on home and non-home at 1024px and 1440px align to the trigger's logical end (`inset-inline-end: 0`), open upward and toward the page interior, keep all four edges inside the viewport, keep the first option clickable, step into options on Tab, and close + restore focus to trigger on Escape.
2. Preserved AL-4 behavior: zero `.header__utility-bar` residual across pages, identical `80.99rem` wide/narrow container threshold with zero overlap/gap, and narrow-screen Header mobile drawer localization regression clean in LTR and RTL.
3. Run: `npm.cmd run lint:theme`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:compat`, `npm.cmd run test:theme-check`, `npm.cmd run lint:records`, `npm.cmd exec -- prettier --check sections/header.liquid sections/footer.liquid`, and `git diff --check`. Confirm live `/localization` POST persistence remains recorded as pending while preview is password-gated.

Output per verifier.md: findings first by impact (file:line, defect, evidence), then proven / unproven, commands run with their output, and a verdict: PASS or FAIL.
```

## Batch AL-3 — Homepage left ruler rail preview

**Status:** Executed; waiting for follow-up verification and user visual acceptance. On 2026-11-24 the user authorized retaining the numeral module and its import map entry, and asked to fix the clipped trailing label. Both follow-up items have been handled.

**Outcome:** Move the homepage architectural ruler rail to the inline-start (left) side inside the centered `Page width` canvas (`[left outer] | [left rail | content] | [right outer]`) with equal outer margins, full-height fixed-pitch ticks/numerals running from Header top edge to Footer bottom edge (without a fixed height cutoff), monotonic width retreat to `0px`, shared Header/Hero/Footer content edges, and unchanged 3-column layout on non-home pages.

**Dependencies:** Resolved (AL-1 localization retest passed; AL-2 用户授权本会话直接审核，技术复查 PASS; current `1200 / 20` and `scheme-2` presets retained).

**Implementation surface:** `assets/base.css`, `layout/theme.liquid`, `snippets/page-rail.liquid`, `snippets/scripts.liquid` (import map entry `"page-rail"`), `assets/page-rail.js` (new on-demand Alpine module), `assets/tailwind.output.css` (rebuilt via `npm.cmd run build:tw`), and `docs/agent/context.md`. Forbidden in this batch: merchant JSON presets (`config/settings_data.json`, `sections/header-group.json`, `sections/footer-group.json`, `templates/*.json`), new merchant settings, Hero composition edits, Header localization edits, and Footer content edits.

**Review tier:** Ask (visual batch modifying `layout/theme.liquid`, `snippets/page-rail.liquid`, `snippets/scripts.liquid`, `assets/page-rail.js`, and `assets/base.css` page-frame layout).

**Estimate:** 45–90 minutes.

**Checkpoint:** Stop and report after implementing the left ruler page frame and unbounded fixed-pitch rail, rebuilding `assets/tailwind.output.css`, passing static/compatibility/record validators, verifying monotonicity/alignment/short-page/normal-page/8600px-tall-page/alternate-settings fixtures, running `npm.cmd run test:layout` and capturing `375 / 768 / 1024 / 1440px` live Shopify preview screenshots, ready for correction review and user visual acceptance without committing or pushing.

**Bar:** Background remains full-bleed; outer left and right margins are equal (`max(page_margin, (available - page_width) / 2)`); on the homepage the left rail (ticks + gap to content) lives inside `Page width` with no reserved right rail; Header, Hero, and Footer share identical left/right content edges within `1px`; ruler runs continuously from Header top to Footer bottom at fixed vertical tick/numeral pitch even on very tall pages (`~8600px+`), scrolls with the page, stays decorative (`aria-hidden="true"`, `pointer-events: none`), and still appears on short/no-Hero pages; content width never shrinks backward as available width grows across rail appear/retreat and `page_width` cap thresholds; non-home pages retain the original symmetric 3-column frame; all static validators and `test:layout` pass with 0 new issues.

### Acceptance checks

- `assets/base.css` computes centered `Page width` canvas with equal outer margins, places the homepage left rail inside `Page width` (`--page-inset-start: calc(var(--page-outer-inset) + var(--page-rail-width))`, `--page-inset-end: var(--page-outer-inset)`), derives `--page-rail-width` monotonically from available canvas width `min(100% - 2 * --page-margin, --page-width)` (0px on non-home), and keeps non-home `--page-grid-columns` on the 3-column track list.
- `layout/theme.liquid` wraps `header-group`, `<main>`, `footer-group`, and conditional homepage `snippets/page-rail.liquid` inside `.page-shell` so `.page-rail` spans Header top to Footer bottom and scrolls with the page.
- `snippets/page-rail.liquid`, `assets/page-rail.js`, and `snippets/scripts.liquid` render fixed-pitch major/medium/minor ticks and numerals (`aria-hidden="true"`) extending seamlessly to Footer on short, normal, and `~8600px+` tall pages without a fixed height cap, clip cleanly via `.page-rail`, degrade progressively via `@container page-rail` (fewer numerals -> shorter ticks -> hidden -> `0px`), and keep above-the-fold marks + infinite CSS ticks usable without JS.
- Only show numerals that fit vertically in the rail. Exercise the `500px` exact-cutoff case and the `8602.6px` fractional-cutoff case, then resize to a height where the last numeral fits and confirm that it appears. CSS ticks continue through the Footer without JavaScript.
- Live Shopify dev preview provides `375 / 768 / 1024 / 1440px` screenshots and measured left/right outer margins, canvas width, rail width, content width, and Header/Hero/Footer alignment deltas (`<= 1px`), plus short/normal/elongated `~8600px` verification.
- Continuous width sweep across rail retreat and `page_width` cap thresholds (plus an alternate `page_width`/`page_margin` fixture without modifying saved settings) verifies 0 backward content-width shrink and non-home 3-column isolation.
- `npm.cmd run build:tw`, `npm.cmd run lint:theme`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run scan:compat`, `npm.cmd run test:theme-check`, `npm.cmd run lint:records`, `npm.cmd exec -- prettier --check` on changed files, `git diff --check`, and `npm.cmd run test:layout` pass.

### Execution log

- Updated `assets/base.css` page-frame tokens so outer left/right margins are equal (`--page-outer-inset: max(var(--page-margin), calc((100% - var(--page-width)) / 2))`), non-home pages keep the original 3-column `--page-grid-columns` with `--page-rail-width: 0px`, and `:root[data-page-rail='true']` derives `--page-canvas-width: min(calc(100% - 2 * var(--page-margin)), var(--page-width))` and `--page-rail-width: clamp(0px, calc((var(--page-canvas-width) - var(--page-rail-content-floor)) * 0.5), var(--page-rail-max))` (`--page-rail-max: 6rem`, `--page-rail-content-floor: 84.8rem`) inside `Page width` on the inline-start side (`--page-inset-start: calc(var(--page-outer-inset) + var(--page-rail-width))`, `--page-inset-end: var(--page-outer-inset)`). Updated `body > .page-shell` (`flex: 1 0 auto`) and `body > .page-shell > main` (`flex-grow: 1`), and moved `.page-rail` to `inset-inline-start: var(--page-outer-inset)`.
- Updated `layout/theme.liquid` to place `{% sections 'footer-group' %}` inside `.page-shell` so `.page-rail` spans continuously from Header top edge to Footer bottom edge and scrolls with the page.
- Rebuilt `snippets/page-rail.liquid` (`aria-hidden="true"`) with fixed vertical pitch (`--rail-step: 6rem` major ticks/numerals `00..1200`, `3rem` medium ticks, `0.6rem` minor ticks via `repeating-linear-gradient`, `--rail-origin: 2rem`) clipped cleanly by `.page-rail { overflow: hidden }`, with progressive `@container page-rail` retreat (`4.99rem` hide even numerals -> `3.79rem` every 4th numeral -> `2.79rem` ticks only -> `0.99rem` hidden -> `0px`).
- **Static validation (post-edit):**
  - `npm.cmd run build:tw`: Done in 64ms (`assets/tailwind.output.css` regenerated).
  - `npm.cmd run lint:theme`: Theme architecture lint passed.
  - `npm.cmd run lint:i18n`: i18n lint passed; Unused locale key lint passed.
  - `npm.cmd run lint:liquid-syntax`: Liquid syntax lint passed.
  - `npm.cmd run scan:compat`: `build:tw` (92ms), `stylelint`, `eslint`, and `lint-embedded-compat` passed (11 stylesheet blocks, 0 javascript blocks).
  - `npm.cmd run test:theme-check`: 67 files inspected with no offenses found.
  - `npm.cmd run lint:records`: board topics: 0, pending migration lines: 0.
  - `npm.cmd exec -- prettier --check assets/base.css layout/theme.liquid snippets/page-rail.liquid`: All matched files use Prettier code style!
  - `git diff --check`: clean.
- **Live Shopify dev preview verification (`http://127.0.0.1:9292`, `joey-new-store.myshopify.com`, dev theme `#190832771146`, `1200 / 20` & `scheme-2`, without `--theme-editor-sync`):**
  - `npm.cmd run test:layout`: **PASS** across all 9 live pages (`home`, `cart`, `search`, `collections`, `collection-all`, `not-found`, `product`, `blog`, `article`, `320..2560px`, `Wall time: 148900ms`, `New issues (not in baseline): 0`).
  - Live measurements (`capture-al3-live.mjs`, overlay scrollbars, screenshots saved in agent artifact dir `al3-live-{375,768,1024,1440}.png`):
    - `375px`: `leftOuter: 16`, `rightOuter: 16`, `canvasW: 343`, `railW: 0`, `contentW: 343`, `alignDeltas (Header/Hero/Footer L & R): 0`, `overflowX: 0`.
    - `768px`: `leftOuter: 17.73`, `rightOuter: 17.73`, `canvasW: 732.53`, `railW: 0`, `contentW: 732.53`, `alignDeltas: 0`, `overflowX: 0`.
    - `1024px`: `leftOuter: 18.86`, `rightOuter: 18.86`, `canvasW: 986.28`, `railW: 60`, `contentW: 926.28`, `alignDeltas: 0`, `heroDescRightVsPortraitLeft: +21.1px` (no crowding), `railSpan: 0 -> 900` (Header top to Footer bottom, 15 marks, fixed `60px` pitch).
    - `1440px`: `leftOuter: 120`, `rightOuter: 120`, `canvasW: 1200` (centered), `railW: 60`, `contentW: 1140`, `alignDeltas: 0`, `railSpan: 0 -> 900` (15 marks, fixed `60px` pitch, `aria-hidden="true"`, `pointer-events: none`).
  - Live continuous sweep on `/` (`880..1030px` and `1220..1260px`, 49 widths): `shrinkViolations: 0`, `maxAlignDelta: 0`, `maxOuterDiff: 0`, `issues: []`.
  - Live non-home `/collections/all`: `hasRailAttr: false`, `hasRailEl: false`; `1024px` (`leftOuter: 18.86`, `rightOuter: 18.86`, `contentW: 986.28`); `1440px` (`leftOuter: 120`, `rightOuter: 120`, `contentW: 1200`), `headerFooterL/R: 0`.
- **Browser fixture verification (`verify-al3-left-rail.mjs`, headless Chrome via `playwright-core`, `failuresCount: 0`; merchant config untouched):**
  - 5 scenarios (`home-1200-20`, `nonhome-1200-20`, `home-1400-32`, `nonhome-1400-32`, `home-1000-40`) × `230` widths (`360..1600px` with 2px dense steps across rail start/ramp and all three `page_width` caps) = `1,150` checks: `shrinkCount: 0`, `maxOuterDiff: 0`, `maxAlignDelta: 0.016px` (includes `.shopify-section > *` grid child alongside Header/Hero/Footer).
  - Alternate settings samples: `home-1400-32` (`1024px`: `27.47 / 969.06 / 60 / 909.06`; `1440px`: `32 / 1376 / 60 / 1316`); `home-1000-40` (`1024px`: `33.2 / 957.59 / 54.78 / 902.8`; `1440px`: `220 / 1000 / 60 / 940`).
  - Height & short/no-Hero fixtures (`1440px`): `short-no-hero` (`500px` tall -> `railTop: 0`, `railBottom: 500`, `8` marks, fixed `60px` pitch, adjacent link clickable via `elementFromPoint`); `hero-default` (`900px` -> `15` marks, `60px` pitch); `tall-page` (`2692.6px` -> `45` marks, `60px` pitch).
  - `@container page-rail` retreat (`1200 / 20`): `1024px` (`railW: 60`, `majorW: 1.4rem`, `00..70`) -> `970px` (`42.4`, `1.1rem`, `00/20/40/60`) -> `950px` (`32.5`, `0.9rem`, `00/40`) -> `920px` (`17.6`, `0.8rem`, ticks only) -> `895px` (`5.2`, `visibility: hidden`) -> `860px` (`0px`).

#### Correction pass — unbounded long-page major ticks and numerals (2026-11-24)

The initial AL-3 review flagged that major ticks and numerals were generated by a fixed Liquid loop (`0..120`, stopping at `~7280px` while medium/minor ticks kept repeating). Fixed without raising a hard cap:

- **CSS ticks (`snippets/page-rail.liquid`):** Moved all three tick layers (major `--rail-major-step`, medium `0.5 * --rail-step`, minor `0.1 * --rail-step`) into a single `repeating-linear-gradient` stack on `.page-rail__track::before` (`inset-block: var(--rail-origin) 0`) so major, medium, and minor ticks repeat infinitely down to Footer at the exact same `6rem` (`60px`) pitch even with JS disabled, and update `--rail-major-step` / `--rail-major-w` cleanly under `@container page-rail` (`4.99rem` -> `2x`, `3.79rem` -> `4x`, `2.79rem` -> ticks only, `0.99rem` -> hidden). Reduced SSR initial loop to `0..16` (17 marks `00..160`, covering `~1040px` above the fold without JS).
- **Dynamic numerals (`assets/page-rail.js`, `snippets/scripts.liquid`):** Added on-demand Alpine module `assets/page-rail.js` (`define('pageRail', ...)` from `'alpine-adapter'`, registered as `"page-rail"` in `snippets/scripts.liquid`, mounted via `x-data="pageRail" data-module-id="page-rail"` on `.page-rail`). Uses `ResizeObserver` on `this.$el`, reads live computed `paddingTop` (`originPx`) and `.page-rail__mark` `height` (`stepPx`), appends or trims `.page-rail__mark` nodes via `DocumentFragment` to `Math.max(1, Math.floor((railHeight - originPx) / stepPx) + 1)`, and disconnects `ResizeObserver` in `destroy()`. Preserves `assets/base.css`, `layout/theme.liquid`, all merchant JSON, Hero composition, Header localization, and Footer content unchanged.
- **Post-correction static checks:**
  - `npm.cmd run build:tw`: Done in 64ms (`assets/tailwind.output.css` unchanged vs prior AL-3 build).
  - `npm.cmd run lint:theme`: Theme architecture lint passed (including `module-import-map-unused` and `one-outlet-per-side-effect`).
  - `npm.cmd run lint:i18n`: i18n lint passed; Unused locale key lint passed.
  - `npm.cmd run lint:liquid-syntax`: Liquid syntax lint passed.
  - `npm.cmd run scan:compat`: `build:tw` (61ms), `stylelint`, `eslint` (including `assets/page-rail.js`), and `lint-embedded-compat` passed (11 stylesheet blocks, 0 javascript blocks).
  - `npm.cmd run test:theme-check`: 67 files inspected with no offenses found.
  - `npm.cmd exec -- prettier --check assets/base.css layout/theme.liquid snippets/page-rail.liquid snippets/scripts.liquid assets/page-rail.js`: All matched files use Prettier code style!
  - `git diff --check`: clean.
- **Post-correction browser fixture verification (headless Chrome via `playwright-core` with real `assets/tailwind.output.css`, extracted `snippets/page-rail.liquid` CSS, `assets/page-rail.js`, and `assets/vendor-alpine.min.js`; scripts in agent scratch outside repo):**
  - `verify-al3-unbounded.mjs` (`failuresCount: 0`):
    - **Short / no-Hero (`500px`):** `railTop: 0 -> railBottom: 500`, `domMarkCount: 9`, `visibleMarkCount: 8` (`00..70`), `uniquePitches: [60]`, `tickLayerBgCount: 3`, `tickLayerHeight: 540`, `lastNumRightGapToContent: 28.9px`.
    - **Normal Hero (`900px`):** `railTop: 0 -> railBottom: 900`, `domMarkCount: 15`, `visibleMarkCount: 15` (`00..140`), `uniquePitches: [60]`, `tickLayerBgCount: 3`, `tickLayerHeight: 900`, `lastNumRightGapToContent: 22.3px`.
    - **Elongated `~8600px` (`8602.6px`, exceeding old `~7280px` cap):** `railTop: 0 -> railBottom: 8602.6`, `domMarkCount: 144`, `visibleMarkCount: 144` (`00..1430`), `lastMarkTop: 8600`, `gapFromLastMarkToFooterBottom: 2.59px`, `uniquePitches: [60]`, `tickLayerBgCount: 3`, `tickLayerHeight: 8640`, `lastNumRightGapToContent: 15.8px` (4-digit `1430` clears content edge cleanly).
    - **Dynamic `ResizeObserver`:** `900px` (`15` marks) -> stretched to `8602.6px` (`144` marks, `00..1430`) -> shrunk to `500px` (`9` DOM / `8` visible marks, `00..70`).
    - **No-JS (`javaScriptEnabled: false`, `8602.6px`):** 17 SSR marks (`00..160`); CSS `::before` 3-layer ticks still extend `8582.59px` to Footer bottom (`8602.6px`).
  - **Regression (`verify-al3-left-rail.mjs`, `failuresCount: 0`):** 5 scenarios (`home-1200-20`, `nonhome-1200-20`, `home-1400-32`, `nonhome-1400-32`, `home-1000-40`) × `230` widths = `1,150` checks: `shrinkCount: 0`, `maxOuterDiff: 0`, `maxAlignDelta: 0.016px`; all 6 `@container page-rail` stages passed.
- **Post-correction live Shopify dev preview verification (`http://127.0.0.1:9292`, `joey-new-store.myshopify.com`, dev theme `#190832771146`, `1200 / 20` & `scheme-2`, without `--theme-editor-sync`):**
  - `npm.cmd run test:layout`: **PASS** across all 9 live pages (`home`, `cart`, `search`, `collections`, `collection-all`, `not-found`, `product`, `blog`, `article`, `320..2560px`, `Wall time: 148355ms`, `New issues (not in baseline): 0`).
  - Live runtime & elongated/shortened probes (`verify-al3-live-8600.mjs`, `assets/page-rail.js` HTTP `200`, `pageErrors: []`, `mounted: true`):
    - **Normal live homepage (`1440px`, `900px` tall):** `leftOuter: 120`, `rightOuter: 120`, `canvasW: 1200`, `railW: 60`, `contentW: 1140`, `headerHeroL/R: 0`, `headerFooterL/R: 0`, `15` marks (`00..140`), `uniquePitches: [60]`.
    - **Live elongated homepage (`1440px`, temporary in-memory `#MainContent { min-height: 8460px }` -> `8595.6px` total, screenshot `al3-live-8600-bottom.png`):** `143` marks (`00..1420`), `lastMarkTop: 8540`, `gapToFooterBottom: 55.59px`, `tickLayerHeight: 8580`, `tickLayerBgCount: 3`, `uniquePitches: [60]`, `lastNumRightGapToContent: 15.8px`, `headerFooterL/R: 0`.
    - **Live shortened homepage (`1440px`, `500px` tall, Hero hidden in-memory):** `8` visible marks (`00..70`), `9` DOM marks, `headerFooterL/R: 0`, `uniquePitches: [60]`.
    - **Live non-home `/collections/all` (`1440px`):** `hasRailAttr: false`, `hasRailEl: false`, `leftOuter: 120`, `rightOuter: 120`, `contentW: 1200`.

#### Follow-up — trailing label fit and scope authorization (2026-11-24)

- User authorization: After the two correction-review findings were presented, the user replied “这两项处理完毕呗”. This authorizes retaining `assets/page-rail.js` and the `page-rail` registration in `snippets/scripts.liquid`, and fixing the last label's fit. The authorization follows the first implementation of those files.
- `assets/page-rail.js` now measures the first numeral's bottom edge and the mark pitch using browser geometry, and renders only labels whose entire box fits in the rail. `snippets/page-rail.liquid` retains one invisible mark for measurement. It paints all three tick layers without JavaScript and shows numerals after fit has been measured. The shared frame, preset, Header, Hero and Footer are unchanged in this follow-up.
- Chrome fixture with the current CSS and Alpine: at `500px`, 8 labels, ending `70`; at `900px`, 15, ending `140`; at `8602.6px`, 143, ending `1420`; at `8606px`, 144, ending `1430`; after shrinking to `500px`, 8 labels again. All had `0` clipped labels, a `60px` pitch and three tick layers reaching the rail's bottom. At `375px` wide the `0px` rail had no visible labels, and restoring desktop width restored them. With no JS, all three tick layers reached the bottom without showing unmeasured labels. Removing the rail disconnected its `ResizeObserver`. No fixture page errors.
- `npm.cmd run build:tw`, `lint:compat`, `lint:theme`, `lint:liquid-syntax`, `test:theme-check` (67 files, no offenses), Prettier on the two follow-up files, and `git diff --check` passed. No dev server was available, so the existing layout suite report predates this label-fit follow-up.

### Independent review prompt

```text
You are the Verifier for Joey-Fjh/my-theme-2 (D:\project\shopify_project\my-theme-2). Read AGENTS.md, docs/project.md, .agents/roles/verifier.md, and the Batch AL-3 plan in docs/agent/context.md, and follow the Verifier role: read-only, no edits, no builds, formatters or server starts, no commits, no subagents.

Batch under review: "Batch AL-3 — Homepage left ruler rail preview". Do not inherit the implementer's claims; re-run everything yourself.

Scope: working-tree changes belonging to AL-3 (`assets/base.css`, `layout/theme.liquid`, `snippets/page-rail.liquid`, `snippets/scripts.liquid`, `assets/page-rail.js`, `assets/tailwind.output.css`, and `docs/agent/context.md`). Other working-tree changes belong to AL-1 and AL-2. Confirm no new merchant settings, no AL-3 edits to merchant JSON presets, Hero composition, Header localization, or Footer content.

Review: correction.

Verify:
1. Long-page (`~8600px+`, exceeding the previous `~7280px` cutoff) homepage major ticks, medium/minor ticks, and numerals continue on the fixed pitch (`6rem` / `60px`) without a hardcoded upper bound. Check full numeral bounds at `500px`, `900px`, `8602.6px`, and `8606px`; the last numeral appears only when it fits. Check that CSS ticks continue without JavaScript and that `ResizeObserver` disconnects on unmount.
2. Preserved AL-3 behavior: centered `Page width` canvas with equal outer margins, homepage left rail inside `Page width` (no right rail), shared Header/Hero/Footer/`grid-column: content` edges within 1px, 0 backward content-width shrink across appear/retreat and `page_width` cap thresholds, and unchanged non-home symmetric 3-column layout.
3. Corrected review records in `docs/agent/context.md` (AL-2 wording: "用户授权本会话直接审核，技术复查 PASS", aligned AL-3 dependency note, and explicit authorization to retain the numeral module and import map entry).
4. Run: `npm.cmd run lint:theme`, `npm.cmd run lint:i18n`, `npm.cmd run lint:liquid-syntax`, `npm.cmd run lint:compat`, `npm.cmd run test:theme-check`, `npm.cmd run lint:records`, `npm.cmd exec -- prettier --check assets/base.css layout/theme.liquid snippets/page-rail.liquid snippets/scripts.liquid assets/page-rail.js`, `git diff --check`, and `npm.cmd run test:layout` (when dev server is running).

Output per verifier.md: findings first by impact (file:line, defect, evidence), then proven / unproven, commands run with their output, and a verdict: PASS or FAIL.
```

## Batch AL-1 — Option B page frame, homepage right rail, Header, and Hero

**Status:** Executed; independent localization retest passed. Waiting for authenticated storefront localization verification and user visual acceptance.

**Outcome:** Implement the shared four-track Option B page frame in `assets/base.css`, the homepage-only continuous right ruler rail in `layout/theme.liquid` and `snippets/page-rail.liquid`, code-owned mono/light-italic font tokens in `snippets/css-variables.liquid`, the refactored Header in `sections/header.liquid`, and the new signature homepage Hero in `sections/hero.liquid` with translated schema and fallback copy, without touching merchant-owned JSON files.

**Dependencies:** Resolved (mapping approved and Batch AL-1 explicitly authorized by the user on 2026-11-24). The user later decided to keep the existing global settings instead of applying the proposed AL-2 preset values.

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

The 2026-11-24 initial review returned **FAIL** with six findings. All six findings have been fixed relative to `78b7525` inside AL-1's approved implementation surface without modifying `config/settings_data.json`, `sections/header-group.json`, or `templates/index.json`:

1. **Desktop & mobile country/language selectors (`sections/header.liquid`):** Added conditional `.header__utility-bar` inside `.header__frame` (rendered when `localization.available_countries.size > 1` or `localization.available_languages.size > 1`, hidden at `@container header-frame (max-width: 80.99rem)`) rendering `country-localization` (`HeaderCountry`) and `language-localization` (`HeaderLanguage`), while keeping mobile drawer entries with distinct IDs (`HeaderMobileCountry`, `HeaderMobileLanguage`) guarded by `has_country_selector` / `has_language_selector`.
2. **Third-level mobile drawer destinations (`sections/header.liquid`):** Added `childlink.links` (`grandchildlink`) rendering (`.header__drawer-grandlist` / `.header__drawer-grandlink`) and scrollable `.header__drawer-panel` (`max-height: calc(var(--screen-height) - 8rem); overflow-y: auto;`) inside the progressive `<details>` drawer wired to `assets/dropdown.js`.
3. **Header overlap prevention (`sections/header.liquid`):** Updated desktop `.header__bar` to `grid-template-columns: minmax(0, auto) minmax(0, 1fr) auto`, mobile `.header__bar` to `grid-template-columns: minmax(0, 1fr) auto`, constrained `.header__brand` (`max-width: 100%; min-width: 0;`), `.header__brand .theme-image` (`width: min(var(--header-logo-width), 100%); max-width: 100%;`), and `.header__wordmark` (`max-width: 100%; overflow-wrap: break-word;`), and enabled multi-line wrapping on `.header__nav .header-dropdown-menu > ul` (`flex-wrap: wrap; row-gap: var(--spacing-step-2xs);`) so Search remains visible and unobstructed across supported logo widths and long navigation labels.
4. **Hero image `sizes` (`sections/hero.liquid`):** Updated `sizes` to `'(min-width: 1200px) 692px, (min-width: 900px) 56vw, (min-width: 680px) 53vw, (min-width: 420px) 340px, 85vw'`, covering the `1280px` / `page_width: 2000` / `page_margin: 10` overlay-scrollbar counterexample (`674px` non-home, `670.69px` home <= `692px`) and all supported `page_width` (`1000..2000`) and `page_margin` (`10..100`) combinations in both 2-column and stacked layouts.
5. **Hero CTA loaded body-font weight (`snippets/css-variables.liquid`, `sections/hero.liquid`):** Added `--font-body-weight` (`settings.type_body_font.weight`) and `--font-body-weight-bold` (`body_font_bold.weight` when loaded, otherwise `settings.type_body_font.weight`) in `snippets/css-variables.liquid` and switched `.hero__cta` from `var(--font-heading-weight)` to `var(--font-body-weight-bold)`.
6. **Prettier formatting (`assets/base.css`, `snippets/page-rail.liquid`, `sections/header.liquid`, `sections/hero.liquid`):** Manually corrected formatting (including rewording `@container` inside `snippets/page-rail.liquid` `{% doc %}` and line wrapping in `assets/base.css`, `sections/header.liquid`, and `sections/hero.liquid`) without running `prettier --write`; `npm.cmd exec -- prettier --check` now passes on all eight AL-1 files.

#### Correction-pass validation evidence (2026-11-24)

- **`review-animations` re-audit:** Read `.agents/skills/review-animations/SKILL.md` and `STANDARDS.md`. New hover color transitions on `.header__utility-bar .localization-switcher :where(button)` and `.header__drawer-grandlink` in `sections/header.liquid` are gated by `@media (hover: hover) and (pointer: fine)`, use `var(--motion-duration-fast)` (`250ms` < `300ms`) and `var(--motion-ease-default)` (`cubic-bezier(0.22, 1, 0.36, 1)`), avoid layout properties and `transition: all`, and honor `@media (prefers-reduced-motion: reduce)` (`0.01ms`). Verdict: **Approve** (0 findings).
- **Static checks (post-fix):**
  - `npm.cmd run build:tw`: Done in 64ms (`assets/tailwind.output.css` regenerated; diff limited to `assets/base.css` `--page-grid-columns` line wrap, 0 stray utilities).
  - `npm.cmd run lint:theme`: Theme architecture lint passed.
  - `npm.cmd run lint:i18n`: i18n lint passed; Unused locale key lint passed.
  - `npm.cmd run lint:liquid-syntax`: Liquid syntax lint passed.
  - `npm.cmd run scan:compat`: `build:tw` (69ms), `stylelint`, `eslint`, and `lint-embedded-compat` passed (11 stylesheet blocks, 0 javascript blocks).
  - `npm.cmd run test:theme-check`: 67 files inspected with no offenses found.
  - `npm.cmd run scan:contrast`: 0 failing pair(s).
  - `npm.cmd exec -- prettier --check assets/base.css layout/theme.liquid snippets/css-variables.liquid snippets/page-rail.liquid sections/header.liquid sections/hero.liquid locales/en.default.json locales/en.default.schema.json`: All matched files use Prettier code style!
  - `npm.cmd run lint:records`: board topics: 0, pending migration lines: 0.
  - `git diff --check`: clean.
- **Browser fixture verification (headless Chrome via `playwright-core` with real `assets/tailwind.output.css`, extracted Liquid `{% stylesheet %}` blocks, `assets/dropdown.js`, `assets/localization-switcher.js`, and `assets/vendor-alpine.min.js`; script stored in agent scratch outside repo, `failuresCount: 0`):**
  - **Finding 1 (Localization):** 0 duplicate DOM IDs, 0 page errors. At `1440px` and `1024px`, `.header__utility-bar` displays `#HeaderCountry` and `#HeaderLanguage`; clicking `#HeaderCountry` opens `#country-list-HeaderCountry` (`aria-expanded="true"`, `display: block`) and `Escape` closes it (`aria-expanded="false"`, `display: none`) and restores focus to trigger. At `390px`, `.header__utility-bar` is `display: none` and mobile drawer exposes `#HeaderMobileCountry` and `#HeaderMobileLanguage`.
  - **Finding 2 (Mobile drawer 3rd-level + keyboard/Escape):** At `390px`, focusing `.header__menu-trigger` and pressing `Enter` opens `.header__drawer` (`open: true`, `aria-expanded="true"`), showing both 3rd-level links (`Angular Acetate`, `Titanium Rim`, `280.625px × 36px`). Focusing a 3rd-level link and pressing `Escape` closes the drawer (`open: false`, `aria-expanded="false"`) and returns focus to `.header__menu-trigger`. `Space` open + `Escape` close also passed.
  - **Finding 3 (Header overlap):** Zero horizontal overflow, zero brand/nav/tools overlap, Search inside `.header__frame` and clickable via `elementFromPoint` in all 7 tested cases: `390px` + `300px` logo (logo clamped to `196.2px`, `brandRight: 222.5 < searchLeft: 231.6`), `375px` + `300px` logo (`182px`, `208 < 217`), `1024px` + 5 long labels home (`navRows: 2`, `brandRight: 181.2`, `searchLeft: 774.4`) & non-home (`navRows: 2`, `185.7`, `831.3`), `1024px` + `300px` logo + 5 long labels (`navRows: 3`), `904px` + `300px` logo + 5 long labels (`navRows: 3`), and `1440px` default 5 short labels (`navRows: 1`).
  - **Finding 4 (Hero `sizes`):** 240 checks across 8 `(page_width, page_margin, hasRail)` configs (`2000/10` home & non-home, `2000/100`, `1400/32` home & non-home, `1200/20`, `1000/10`, `1000/100`) × 30 viewports (`320..1920px`) with `--enable-features=OverlayScrollbar`: 0 under-declarations, minimum slack `+11.95px` (worst case `899px` non-home `2000/10`: measured `464.52px` vs declared `476.47px`). Known counterexample `1280px` / `2000` / `10` / overlay scrollbars (`clientWidth: 1280`): measured `670.69px` (home) and `674px` (non-home) vs declared `692px` (`+21.31px` / `+18px`).
  - **Finding 5 (Hero CTA font weight):** With distinct heading/body families (`HeadingOnlyFace 500` vs `BodyFace 400/700`), `.hero__cta` computed `BodyFace, sans-serif` weight `700`; when body has no bold face (`HeadingOnlyFace 600` vs `BodySingleFace 400`), `.hero__cta` computed `BodySingleFace, sans-serif` weight `400`.
  - **Bar regression sweep:** 6 scenarios (`home-1400-32`, `home-1400-32-loc`, `home-1200-32`, `home-1200-20`, `home-1400-48`, `nonhome-1400-32`) × 149 viewports (`360..1500px`) = 894 checks: `maxLeftDelta: 0`, `maxRightDelta: 0`, `shrinkViolations: 0`, `nonHomeRailMax: 0`, `overflowX: 0`.
- **Unverified (live Shopify storefront):** Live `shopify theme dev` rendering with real Shopify Liquid `font_modify` / `font_face` CDN delivery, Shopify `{% form 'localization' %}` submission, `<shopify-account>` web component rendering, `npm.cmd run test:layout` against the live storefront, and user visual acceptance at 375/768/1024/1440px remain pending until live store preview / Batch AL-2.

#### Correction-review FAIL & localization follow-up fix (2026-11-24)

The correction review returned **FAIL** on two localization findings (the remaining AL-1 fixes passed). The user authorized a targeted follow-up fix within AL-1's existing scope (`sections/header.liquid` only; no changes to shared `snippets/localization-switcher.liquid`, `assets/*.js`, or merchant JSON):

1. **Mobile `390 × 650` drawer localization clipping (short and long menus):** Previously `.header__drawer-panel` scrolled as a single container (`overflow-y: auto`), causing the absolutely positioned `top: 100%` `.localization-menu` inside bottom `.header__drawer-utilities` to open below the panel clip edge (`0` options immediately visible/clickable in both short and long menus; `panelRect.b = 196` vs `menuRect.t = 189..429` in short menu, `panelRect.b = 628` vs `menuRect.t = 627..867` in long menu). Fixed in `sections/header.liquid` by making `.header__drawer-panel` a bounded flex column (`display: flex; flex-direction: column; overflow: hidden; max-height: calc(var(--screen-height) - 8rem)`), keeping `.header__drawer-list` independently scrollable (`flex: 1 1 auto; min-height: 0; overflow-y: auto`), pinning `.header__drawer-utilities` (`flex: 0 0 auto; flex-direction: column`), and rendering `.header__drawer-utilities .localization-switcher .localization-menu` in-flow (`position: static; width: 100%; max-height: min(18rem, calc(var(--screen-height) * 0.32)); overflow-y: auto;`) with `(0,3,0)` specificity so it overrides `snippets/localization-switcher.liquid` regardless of stylesheet bundle order.
2. **Desktop `1024px` / `1440px` narrow localization dropdown width (`Spain` current):** Previously `.localization-menu` lacked an explicit width and inherited `overflow-wrap: anywhere` from `snippets/localization-switcher.liquid`, collapsing to the `48px` width of `Spain` and breaking `Netherlands` and `Luxembourg` into `36–37px` multi-line chunks (`76–94px` tall). Fixed in `sections/header.liquid` with `.header__utility-bar .localization-switcher .localization-menu` (`width: max-content; min-width: min(22rem, calc(100cqi - var(--spacing-step-l))); max-width: min(32rem, calc(100cqi - var(--spacing-step-l)));`) and `.header__frame .localization-switcher .localization-option` (`padding: 0.45em 0.65em; text-align: start; overflow-wrap: break-word;`).

- **Post-fix static validation:**
  - `npm.cmd run build:tw`: Done in 59ms (`assets/tailwind.output.css` unchanged vs prior correction build).
  - `npm.cmd run lint:theme`: Theme architecture lint passed.
  - `npm.cmd run lint:i18n`: i18n lint passed; Unused locale key lint passed.
  - `npm.cmd run lint:liquid-syntax`: Liquid syntax lint passed.
  - `npm.cmd run scan:compat`: `build:tw` (63ms), `stylelint`, `eslint`, and `lint-embedded-compat` passed (11 stylesheet blocks, 0 javascript blocks).
  - `npm.cmd run test:theme-check`: 67 files inspected with no offenses found.
  - `npm.cmd run scan:contrast`: 0 failing pair(s).
  - `npm.cmd exec -- prettier --check assets/base.css layout/theme.liquid snippets/css-variables.liquid snippets/page-rail.liquid sections/header.liquid sections/hero.liquid locales/en.default.json locales/en.default.schema.json`: All matched files use Prettier code style!
  - `npm.cmd run lint:records`: board topics: 0, pending migration lines: 0.
  - `git diff --check`: clean.
- **Post-fix browser fixture verification (headless Chrome via `playwright-core`, testing with `snippets/localization-switcher.liquid` CSS loaded after `sections/header.liquid` CSS to verify specificity independence; `failuresCount: 0` on both `verify-loc-fix.mjs` and `verify-al1-fixes.mjs`):**
  - **Mobile `390 × 650` (short menu & 12×3-level long menu, Country & Language, zero pre-scroll `panelScrollTop: 0`):** All 4 combinations immediately show **4** fully visible and `elementFromPoint`-clickable options inside `.header__drawer-panel` and viewport (`panelBottom: 428` short / `628` long <= `650`, `menuRect.h: 180`, `menuRect.w: 300–320`). Scrolling `.localization-menu` reaches the last option (`United States` at `scrollTop: 145` / `繁體中文（台灣）` at `scrollTop: 85`, fully visible and clickable). Keyboard `Tab` steps cleanly from trigger into options (`Spain` -> `Netherlands`, `Español` -> `English`). Pressing `Escape` from an option closes both the localization menu (`aria-expanded="false"`, `display: none`) and drawer and places focus on the visible `.header__menu-trigger` (`SUMMARY`, `activeVisible: true`).
  - **Desktop `1024px` & `1440px` (`Spain` current, both without and with currencies):** Country menu renders at `320px` wide (`insideViewport: true`), `Netherlands` and `Luxembourg` each render on **1 line** (`h: 32px`, `overflowX: 0`), `South Georgia and the South Sandwich Islands` wraps cleanly across **2 lines** (`h: 47px`, `overflowX: 0`). Language menu renders at `220px` wide (`insideViewport: true`, all options 1 line, `overflowX: 0`), closes on outside click. Mouse click, `Tab` (`Spain` -> `Netherlands`), and `Escape` from option (`expanded: "false"`, `hidden: true`, `focusedTrigger: true`) all pass.
  - **Regression re-check (`verify-al1-fixes.mjs`, `failuresCount: 0`):** 3rd-level mobile menu + Enter/Space/Escape, `390px`/`375px` `300px` logo + clickable Search (`brandRight: 222.5 < searchLeft: 231.6`), `1024px`/`904px` 5 long-label items + clickable Search, 240 Hero `sizes` checks (0 under-declarations, `1280px`/`2000`/`10` overlay scrollbar `670.69px` home / `674px` non-home <= `692px`), Hero CTA loaded body-font weight (`700` / `400`), and 894 Bar alignment/monotonicity/non-home-rail checks (`maxLeftDelta: 0`, `maxRightDelta: 0`, `shrinkViolations: 0`, `nonHomeRailMax: 0`) all passed.
- **Still unverified (live Shopify storefront):** Live `shopify theme dev` rendering, real Shopify `{% form 'localization' %}` submission, CDN font delivery, `<shopify-account>` rendering, `npm.cmd run test:layout`, and user visual acceptance.

#### Independent localization re-test result (2026-11-24)

- **Verdict:** **PASS** on both localization findings (mobile `390 × 650` short/long drawer visibility, scrolling, keyboard/Escape focus; desktop `1024px` / `1440px` `Spain` / `Netherlands` / `Luxembourg` width, wrapping, viewport bounds, mouse/Tab/Escape), with prior FAIL and follow-up fix records preserved above.
- **Live Shopify dev preview & `test:layout` (2026-11-24, `joey-new-store.myshopify.com`, dev theme `#190832771146`, `http://127.0.0.1:9292`, without `--theme-editor-sync`; merchant JSON untouched):**
  - `npm.cmd run test:layout`: **PASS** across all 9 live pages (`home`, `cart`, `search`, `collections`, `collection-all`, `not-found`, `product`, `blog`, `article`) from `320px` to `2560px` (`horizontal-scroll: 0`, `unclipped-overflow: 0`, `page-margin: 0`, `tap-targets: 0`, `clipped-text: 0`, `runtime: 0`, `New issues (not in baseline): 0`, `Wall time: 144769ms`).
  - Live tokens & Shopify CDN fonts verified on `http://127.0.0.1:9292/`: `--font-body-weight: 400`, `--font-body-weight-bold: 700`, `--font-heading-weight: 700`, `--font-heading-light-weight: 300`, `Inter` loaded (`400` and `700`).
  - Live Header & localization UI verified on `http://127.0.0.1:9292/`: desktop `#HeaderCountry` dropdown `220px` inside viewport at `1024px` and `1440px`; mobile `390 × 650` drawer `#HeaderMobileCountry` immediately shows both store countries (`China CNY ¥`, `United States USD $`, `panelBottom: 628 <= 650`).
  - Live `/?section_id=hero` Section Rendering API returned `HTTP 200` (`41899` bytes) with real locale defaults (`AXIS / LAYR`, `Architectural Eyewear`, placeholder SVG, 5 crosshairs, CTA omitted when `cta_link` blank). In-memory DOM mount of the live Shopify Hero output alongside live Header at `375 / 768 / 1024 / 1440px` verified `leftDelta: 0`, `rightDelta: 0`, `cols: 1` at `375px` (`contentW: 328`, `portraitW: 277.2`), `cols: 2` at `768 / 1024 / 1440px` (`contentW: 717.5 / 911.3 / 1200`, `portraitW: 372.7 / 499.6 / 688.7`, `railW: 0 / 60 / 60`). Because `templates/index.json` is merchant-owned and currently renders only `custom-liquid`, full-page Hero preview awaits Theme Editor addition on the ephemeral dev theme or user authorization of an isolated preview / Batch AL-2.
  - **Blocked on storefront password for real `/localization` POST submission:** On `http://127.0.0.1:9292`, submitting `#HeaderCountry` (`country_code=CN`) and `#HeaderLanguage` (`locale_code=zh-TW`) emitted valid Shopify `{% form 'localization' %}` multipart POST payloads (`form_type=localization`, `_method=put`, `return_to=/?_fd=0&pb=0`) but the local CLI dev proxy returned `HTTP 401`; the direct shareable URL `https://joey-new-store.myshopify.com/?preview_theme_id=190832771146` redirects to `/password` (`STOREFRONT_PASSWORD` not set locally). Real end-to-end `/localization` POST redirect/persistence requires unlocking the password-protected preview in the user's browser (or Theme Editor) or supplying `STOREFRONT_PASSWORD` locally.
- **Next gate:** User visual acceptance at `375 / 768 / 1024 / 1440px`, authenticated live `/localization` submission verification, and decision on Hero preview / Batch AL-2 authorization.

### Independent review prompt

```text
You are the Verifier for axis-layr-theme (D:\project\shopify_project\my-theme-2). Read AGENTS.md, then .agents/roles/verifier.md, and follow that role: read-only, no edits, no builds, formatters or server starts, no commits, no subagents.

Batch under review: "Batch AL-1 — Option B page frame, homepage right rail, Header, and Hero". The plan, acceptance checks, six prior review findings, and implementer's correction evidence are in docs/agent/context.md. Do not inherit those claims; re-run everything yourself.

Scope: uncommitted working-tree corrections relative to wip/al-1 baseline 78b7525 (`git diff 78b7525`) plus full AL-1 implementation surface relative to e920623: assets/base.css, layout/theme.liquid, snippets/css-variables.liquid, snippets/page-rail.liquid, sections/header.liquid, sections/hero.liquid, locales/en.default.json, locales/en.default.schema.json, assets/tailwind.output.css, and docs/agent/context.md. Confirm config/settings_data.json, sections/header-group.json, templates/index.json, and AXIS-DRAFT status/backlog remain untouched.

Review: correction.

Verify:
1. All six findings from the 2026-11-24 FAIL review are resolved cleanly: (a) desktop & mobile country/language selectors with unique IDs, (b) 3rd-level mobile drawer destinations + keyboard/Escape, (c) Header zero overlap at 390px with 300px logo and 1024px with 5 long-label items (Search visible/clickable), (d) Hero image sizes covering 1280px / page_width: 2000 / page_margin: 10 / overlay scrollbars and supported 2-col/stacked ranges, (e) Hero CTA using loaded body-font weight when body and heading families differ, (f) Prettier check passing on all edited AL-1 files.
2. No regression to Header/Hero edge alignment, 2-column monotonicity, non-home zero-width rail, schema IDs, JSON-LD, or merchant-owned files.

Run: npm.cmd run lint:theme, npm.cmd run lint:i18n, npm.cmd run lint:liquid-syntax, npm.cmd run lint:compat, npm.cmd run lint:records, npm.cmd run test:theme-check, npm.cmd run scan:contrast, npm.cmd exec -- prettier --check assets/base.css layout/theme.liquid snippets/css-variables.liquid snippets/page-rail.liquid sections/header.liquid sections/hero.liquid locales/en.default.json locales/en.default.schema.json, git diff --check, git status --short.

Output per verifier.md: findings first by impact (file:line, defect, evidence), then proven / unproven, commands run with their output, and a verdict: PASS or FAIL. FAIL only on evidence of a violated requirement, project rule or correctness problem; the rest are notes.
```

## Batch AL-2 — Single light scheme and default homepage Hero

**Status:** Executed; 用户授权本会话直接审核，技术复查 PASS. Waiting for user storefront visual acceptance alongside AL-3 preview. The three preset edits and the removal of the separate page background scheme selector were authorized on 2026-11-24.

**Outcome:** Preserve the remaining global settings, use the existing light scheme as the single preset scheme and the page canvas, and use the existing Hero in the default homepage template.

**Dependencies:** AL-1's Hero and its schema are present. The user's explicit scope covers deletion of the dark preset scheme, repointing its Header and Footer defaults, and replacing the homepage Custom Liquid instance. This supersedes the earlier proposed width, margin, typography and palette values.

**Implementation surface:** `config/settings_data.json`, `sections/header-group.json`, `sections/footer-group.json`, `sections/footer.liquid` (color scheme default only), `templates/index.json`, `config/settings_schema.json`, `layout/theme.liquid`, `locales/en.default.schema.json`, `DESIGN.md`, `docs/references/style-system/css-architecture.md`, `docs/references/style-system/design-to-delivery.md`, and agent records. The follow-up scope removes the page canvas selector and its consumer and translations, and updates the three descriptions of that setting to match. The user's 2026-11-24 instruction authorizes the merchant JSON changes and is the basis for the `Merchant-Change:` trailer if a commit is requested.

**Review tier:** Ask because the batch deletes setting and locale keys and changes Liquid, schema and references. The independent review covers the AL-2 diff only. User visual acceptance follows at 375, 768, 1024 and 1440 CSS px.

**Estimate:** One focused edit and static validation pass, roughly 20–30 minutes. The user runs the storefront preview for the visual check.

**Checkpoint:** Stop after implementing and validating the preset and schema changes and handing them off for independent review and visual acceptance. Run `test:layout` when the user's Shopify development preview is available.

**Bar:** The original `scheme-2` values and every saved global value outside `color_schemes` are identical to baseline. The page canvas inherits the first scheme's existing root tokens with no separate editable selector. The single default homepage section resolves to Hero with its own schema defaults, and Header and Footer resolve to the surviving scheme. Changes to the ruler, Hero composition, media, storefront copy, links and other page templates are outside this batch.

### Acceptance checks

- Parse the before/after settings and confirm that deleting `scheme-1` is the only change. Verify the template contains and orders `main` as a single `hero` section and uses no inherited Custom Liquid padding or content overrides.
- Inspect active color-scheme references and defaults under config, layout, sections, snippets, blocks and templates. Verify the existing Header and Footer JSON differs only in `color_scheme`, and the Footer schema continues to supply a valid default for a new Footer instance.
- Verify the deleted page canvas schema control, its two translations and its runtime reader are absent. Check that the body still uses the same colors from the existing `:root` scheme fallback and that scoped sections still override inherited colors.
- Run `npm.cmd run lint:theme`, `npm.cmd run test:theme-check`, `npm.cmd run lint:records` and `git diff --check`. Verify the composed homepage and the active scheme in the theme preview at the accepted widths before visual acceptance.
- For the selector removal also run `npm.cmd run lint:i18n` and `npm.cmd run lint:doc-paths`. Check the agent checkout when updating references with `npm.cmd run doctor:agent`.

### Execution log

- Preserved the `main` section ID and order. Replaced its section type with `hero`, selected `scheme-2`, and removed the old Custom Liquid padding overrides so the Hero uses its schema defaults. The Custom Liquid section remains available to add in the editor.
- Deleted only `current.color_schemes.scheme-1`. Moved the Header and Footer section groups and the Footer schema default to `scheme-2`. A read-only JSONC comparison against `78b7525` passed for all four JSON files. The Footer Liquid diff is one schema default, and a scoped search found no active `scheme-1` reference.
- `lint:theme`, `lint:records`, `scan:contrast` (0 failing pairs), `test:theme-check` (67 files inspected, no offenses), Prettier on the five changed theme files, and `git diff --check` passed. The Shopify Liquid validator returned VALID for all five files using its cached schemas after a cache-write permission warning.
- Follow-up: Removed the global page canvas selector, its schema label and help text, and the layout reader and body class. The first configured scheme's existing root tokens now paint the body. Updated the design draft and two color-system references to reflect this behavior. The preset values and section-level controls did not change in this follow-up.
- Rechecked `lint:theme`, `lint:i18n`, `lint:doc-paths`, `lint:records`, `test:theme-check` (67 files, no offenses), Prettier on the follow-up files and `git diff --check`. The Shopify validator returned VALID for all three theme files using cached schemas. A local Chrome fixture using the current preset tokens and the existing `body` paint declarations showed identical white background and ink foreground with and without the removed class; a section with its own test scheme retained its colors. `doctor:agent` still reports the two existing Windows checkout symlink issues for `CLAUDE.md` and `.claude/skills`.
- No Shopify development preview was listening at the checkpoint. `test:layout`, the editor's retained scheme and rendered homepage, and the user visual pass at 375, 768, 1024 and 1440 CSS px remain pending. The earlier AL-1 layout report predates the homepage Hero wiring.

### Independent review prompt

```text
Review AL-2 in Joey-Fjh/my-theme-2 as a read-only Verifier. Read AGENTS.md, docs/project.md, .agents/roles/verifier.md and the AL-2 plan in docs/agent/context.md. Review the diff against 78b7525 restricted to the AL-2 implementation surface and records. The other working-tree changes belong to AL-1.

Verify that the only saved global settings change is deletion of scheme-1, that scheme-2 keeps its exact values, and that the Header, Footer and new Footer default resolve to scheme-2. Verify the default homepage orders the single main Hero instance and that Custom Liquid remains available. Confirm the page canvas selector, reader, and two translations are gone, and the body inherits the first scheme's tokens while sections still use their own scheme. Assess the reference edits against that accepted change. Run lint:theme, test:theme-check, lint:i18n, lint:records, lint:doc-paths, scan:contrast and git diff --check. Distinguish static checks from the composed homepage and editor verification in a running Shopify preview. Report findings first, then checked and pending evidence and PASS or FAIL for the independent review. Do not edit files or record visual acceptance on the user's behalf.
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
