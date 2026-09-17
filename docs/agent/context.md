# Project Context

Holds the plan currently under execution and its status. Nothing else. Unresolved discussion lives in `docs/agent/board.md`; the lifecycle and the identity rules that used to sit here now live in `AGENTS.md` under Record Layer Contract and Project Identity And Authority.

Last updated: 2026-09-18.

## Decisions the current plan implements

### Accepted JavaScript core boundary

D19 Part A, accepted 2026-09-17. The test is what must exist before any component can load, not which files are library-independent.

- **Always-loaded core: `base.js` and `events.js`, 23,866 bytes.** Against roughly 659,000 bytes loaded unconditionally on every page today, that is about 3.6 percent.
- `rafThrottle` moves into the core, since `base.js` is its only core-side consumer.
- `utils.js` is an on-demand shared module. It has five consumers: `base.js` for `rafThrottle`, and `alpine.components.pagination`, `product-media`, `search`, and `ui` for `prefersReducedMotion`, `debounce`, and the scroll-behavior helpers. It is genuine shared infrastructure, not a misplaced private dependency; it stays out of the core because its four component consumers load on demand and the core needs one function.
- `https.js` is an on-demand service module. `base.js` references `ShopifyHttp` and `SectionRefresher` zero times, and all seven consumers are business components.
- `events.js` stays in the core because the lifecycle needs an event vocabulary; giving the dispatcher private constants would create a second vocabulary that drifts from the bus.

D20, D21 and D24 are all accepted. Implemented by JS1; see its status.

### Accepted JavaScript loading architecture

D21, accepted 2026-09-17. The Skeleton adopts Shopify's currently recommended no-bundler module architecture: an import map in `layout/theme.liquid`, `<script type="module">` with bare specifiers, and dynamic `import()` for interaction-triggered loading. Shopify injects the `es-module-shims` polyfill itself, so the theme ships none.

Conformance was checked against the full Performance best-practices index, not only the two pages that prompted the decision. "Load JavaScript on user interaction, using dynamic `import()` inside event listeners" is itself one of the official recommendations, rated INP High.

- The ESM clause is removed from the `AGENTS.md` Runtime constraints line. The rest of that line belongs to D23.
- ESM is not the only way to load on demand; a conditionally emitted or runtime-injected classic script also works. The ban falls as a consequence of this choice, not of a technical impossibility.
- Converted files lose their IIFE wrapper, since ES modules carry their own scope.
- One official JavaScript recommendation remains uncovered by any decision: render essential content in Liquid and HTML rather than JavaScript, rated LCP High. It constrains D20.

Implemented by JS1; see its status.

### Accepted runtime contract and Skeleton inventory

D20 and D24, accepted 2026-09-17.

**Adapter contract.** Three layers depending only inward. The **core** owns the registry of `type -> () => import(...)`, the lifecycle (`init`, `destroy`, `select`, `deselect`), DOM scanning, IntersectionObserver laziness and MutationObserver cleanup, and knows no component names and no library APIs. The **adapter** exposes exactly `ready()`, `define(name, factory)`, `mount(el)` and `unmount(el)`; nothing in the core may reference a library outside that surface. A **component module** is loaded on demand, calls `adapter.define(...)` itself, and exports the lifecycle handlers the core calls.

**Discovery.** Liquid markup carries a module identifier in a `data-*` attribute; the import map maps it to an asset URL; the core scans the DOM and dynamically imports it. The core stores no manifest, and the 41 hardcoded registrations in `initAlpine()` are deleted rather than relocated.

**Boundaries.** An adapter may not render initial content — markup comes from Liquid, per the official LCP guidance. Critical first-viewport content must be usable with no adapter present.

**State ownership.** The Skeleton owns platform state: cart is hydrated from `body.dataset.initialCart` and mutated through the Cart API, under a Skeleton-owned contract that an adapter bridges its reactivity onto. The adapter owns UI state such as dialog and toast.

**Inventory.** The official Skeleton theme is the reference, not a file-for-file target, plus the Theme Store mandatory list where it falls short. Optional Theme Store declarations are out of scope. Retained sections are the official set mapped onto this repository plus a minimal contact section, each rewritten to a minimal composition. Snippets are kept only where a platform capability cannot function without them or where they are project infrastructure carrying no design decision; the filtering, product-media and navigation clusters each keep one minimal implementation, with `media-video` retained because video is a Shopify product media type. `pickup-availability`, `selling-plan-picker`, `gift-card-recipient-form`, `announcement-bar`, `password-header` and `password-footer` are out.

**Reachability.** A kept file with no retained host is a defect, not a saving, and a retained section may not depend on a cut file. Both directions were closed on 2026-09-18 by `docs/agent/d24-reachability.md`, the SR1 section rewrite, and the template rewrite inside the deletion. Any future inventory change repeats that check.

### Authorized merchant-owned configuration change

Granted by the user on 2026-09-17, for the Skeleton inventory batch only.

- Rewrite each mandatory template's `templates/*.json` to a minimal composition of retained sections, and delete `templates/page.about.json`.
- `config/settings_data.json` and `config/settings_schema.json` are **not** covered and remain untouched.
- This authorization does not extend to the JavaScript migration batch, whose implementation surface excludes `templates/*.json` entirely.

## Plans and status

One plan. It is executed and waits only on verification the agent cannot perform: a browser pass on the user's dev store, and a review of the five stages read together by someone other than the author. The entry is deleted on acceptance.

P3 was accepted and cleared on 2026-09-18: `.shopifyignore` carries `.env` and `.env.*`, and its comment states that whether Shopify CLI would upload them without the rule is unverified. Nothing durable needed migrating; the file is the record.

### JS1 — JavaScript and inventory migration

The batch decided on the board as D19 Part A, D20, D21 and D24. Accepted and authorized 2026-09-17; executed 2026-09-18.

**Status: executed, statically validated, not accepted.**

What it produced:

- Classic `<script src>` tags in `layout/theme.liquid`: 27 to 2, both the Alpine vendor pair, plus one module entry and an import map.
- The 41 hardcoded component registrations and `initAlpine()` are gone. Components are discovered from `data-module-id` in Liquid and loaded with dynamic `import()`. The core holds no component names.
- Core is `base.js` and `events.js`. A library is reached only through the adapter surface `ready`, `define`, `mount`, `unmount`. `__Theme__` appears zero times across `assets/`, `sections/`, `snippets/`, `blocks/` and `layout/`.
- Cart platform state moved to `cart.contract.js`, hydrated from `body.dataset.initialCart`. Dialog and toast stay with the adapter.
- Inventory cut to the official Skeleton reference plus the Theme Store mandatory list: 74 files deleted, 13 mandatory templates rewritten to minimal compositions, `page.about.json` removed. Retained sections rewritten so no retained file renders a cut one.
- Static validation: Theme Check 71 files no offenses; `lint:theme` and `lint:i18n` pass.

Outstanding before acceptance:

1. **Browser verification.** Deferred by decision on 2026-09-18 so the stages could run on static checks alone. It covers lifecycle `init`/`destroy`/`select`/`deselect`, IntersectionObserver laziness, MutationObserver cleanup, no double initialization, Section Rendering refresh, cart add/change/refresh, dialog, toast, Theme Editor select and deselect, footer scroll-to-top, and that a page fetches only the modules it uses. Static checks cannot see any of this: Stage 4 passed every static check while `sections/footer.liquid` called a global that no longer existed.
2. ~~The ESM clause.~~ **Done 2026-09-18.** D21's decision to remove "ESM imports" from the `AGENTS.md` Runtime constraints line had never been executed; the entry forbade ESM while 43 files under `assets/` used it. Removed; `ESM` now appears zero times in `AGENTS.md`, and Theme Check and both lints still pass.
3. Independent review of the whole batch, not stage by stage. Each stage passed its own review; nothing has read the five stages together.

Known debt, not blocking acceptance: footer scroll-to-top lives on the motion-reveal component rather than a navigation owner, so a future motion refactor could silently break it. Shared locale keys still sit under namespaces named after deleted sections.

Rule 11, Tailwind-utilities-first, is not part of this batch; it waits on the CSS decisions under P1+P5b Stage 2.

