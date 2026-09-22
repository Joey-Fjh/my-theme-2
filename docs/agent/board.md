# Work Board

This board holds the one active decision, evidence that has not become a plan, and deferred ideas. `docs/agent/context.md` holds exactly one accepted plan during execution, or no plan. Recording a plan does not authorize implementation. Accepted contracts belong in `AGENTS.md`, a routed reference, code, or configuration; completed execution history belongs in Git.

Last updated: 2026-09-22.

## Status

The mother-template goal was met on 2026-09-22. All five steps were accepted after independent review: Toast and cart drawer removal, product-card anchor, typography and mobile text, JS/CSS architecture closure, and the Agent layer SOP and validator audit. `npm.cmd run lint` and `npm.cmd test` pass. The durable workflow is the Batch SOP in `AGENTS.md`; git holds the execution history.

No active decision. Finishing order for the deadline (agreed 2026-09-22, about 5–6 hours of work): (1) R1 + R6 + R2 as one round; (2) R4 and R3 as two small batches; (3) R8 with the requirement-to-check mapping only, leaving the per-item skeleton status for the first derived theme that targets submission. Deferred: R5 (optional) and R7 (needs a development store and secrets). The next decision is R1.

## Skeleton readiness review (2026-09-22) — proposal, not a plan

Judged purely as a reusable Skeleton mother template. Claude scored **78/100**, GPT **84/100**; the gap is mainly whether the article JSON-LD and an automated accessibility baseline count as deductions (GPT: optional improvements, not blockers for an internal Skeleton). Both reviews agree the largest deduction is the undocumented derived-theme workflow.

Claude's breakdown: storefront baseline 18/20; JS/CSS architecture 18/20; quality gates and CI 15/20 (runtime behavior checked only by manual browser passes); accessibility, SEO, and performance 12/15; derived-theme workflow and versioning 5/15; Agent layer and records 10/10.

Agreed items (one decision at a time, in this order):

- **R1 — Derived-theme workflow (missing).** Define a generic start/update workflow in this repository: how a derived theme starts (GitHub template repo, fork, or copy); what it resets (`theme_info`, board/context, README; any `settings_data.json` reset needs separate authority in the derived theme); which Agent files carry over; and how later mother-template fixes flow downstream (upstream remote and merge, or cherry-pick). README only notes replacing `theme_info` (`README.md:109`). Discuss alone.
- **R2 — Versioning.** Release tags and a short changelog so derived themes know what an update contains. Separate decision after R1, because it depends on the chosen update path.
- **R3 — Fixed browser smoke checklist.** One per-template checklist (product add-to-cart, cart edits, search, contact, password, gift card, mobile form focus, Theme Editor reload) in `launch-gate.md`, referenced by SOP step 8. Run the flows a storefront or editor change affects; documentation-only batches need no storefront browser pass.
- **R4 — CI check for generated CSS.** CI (`.github/workflows/ci.yml`) runs `npm run lint`, `npm run test:validators`, and the Theme Check action, but never rebuilds Tailwind, so a source edit without `build:tw` would ship stale CSS. Add a rebuild and `git diff --exit-code assets/tailwind.output.css`. The output is in sync today. Separate batch from R3 (different owner and validation).
- **R5 — Article structured data (optional SEO).** `snippets/meta-tags.liquid:57-58` emits `product | structured_data` only; articles set `og:type` but no JSON-LD in theme source. Rendered article output (platform or app markup) has not been checked. Shopify's `structured_data` filter supports articles.
- **R6 — Reference sources (user direction 2026-09-22).** Official Skeleton defines the inventory boundary; Horizon is the reference for organization and implementation patterns (section/block structure, settings layering, editor behavior) — learn from it, do not copy code or import its features. Pin the commit when either is cited as evidence. Proposed durable home: one bullet in `AGENTS.md` Project Identity, next to "architecture is decided from Shopify's current official sources". Small; can be recorded with R1.
- **R7 — Official performance tooling (optional, needs the user's store).** Shopify documents these tools (https://shopify.dev/docs/storefronts/themes/best-practices/performance/testing-for-performance); none is built into this repository:
  - Shopify Lighthouse CI GitHub Action: runs Lighthouse against a theme preview on each pull request and can fail below a threshold; needs a development store and repository secrets.
  - Shopify benchmark: a development store loaded with Shopify's test product CSV, the same setup used for Theme Store scoring; test through a `shopifypreview.com` link.
  - Theme Inspector for Chrome: profiles Liquid render time per section and snippet.
  - Web Performance Dashboard: field data in the store admin.
  - Theme Check `AssetSizeCSS` / `AssetSizeJavaScript`: off by default (`.theme-check.yml` extends `recommended` only); limits are 100,000 raw bytes for CSS and 10,000 for JavaScript. If enabled today, `tailwind.output.css` (127 KB raw, 106 KB minified) and `alpine.components.product.js` (29 KB), `https.js` (12 KB), and `base.js` (11 KB) would be flagged. These are optional lint checks, not requirements: absent from the recommended config, thresholds configurable, and the check pages say "compressed size" while the performance guide says raw size. Evidence only; enabling them is a separate decision.
  - The actual Theme Store bar (only if a derived theme targets submission): average Lighthouse performance ≥ 60 and accessibility ≥ 90 across home, product, and collection pages, desktop and mobile, on the benchmark dataset (https://shopify.dev/docs/storefronts/themes/store/requirements).

- **R8 — Theme Store submission gate for derived themes (user direction 2026-09-22).** The skeleton does not have to meet the Theme Store requirements; a derived theme that is forked or templated for sale must pass them before submission, plus any project standard added later. Proposed split:
  - **Skeleton: stay submission-compatible, not submission-complete.** Do not block requirements that are expensive to retrofit. Evidence it already holds: the product main section is block-based (title, vendor, price, description, variant picker, buy buttons, quantity, inventory, collapsible tab) with `@app` and `custom_liquid` blocks (`sections/product.liquid:366`), and `blocks/group.liquid:27` accepts `@app`.
  - **Built into the skeleton, used by derived themes: a submission gate.** A checklist in `launch-gate.md` mapping each official requirement (https://shopify.dev/docs/storefronts/themes/store/requirements) to how it is checked — automated (Theme Check, `lint`), tool-assisted (Lighthouse on the benchmark store per R7: performance ≥ 60, accessibility ≥ 90), or manual (feature inventory, presets, demo content) — and entered as a batch step when the user scopes a derived theme to submission. The requirements themselves stay out of the skeleton inventory, as `AGENTS.md` already states.
  - Fits after R1, since the gate is one stage of the derived-theme workflow (start → develop → submit → update).
  - **Mandatory Theme Store items (source: https://shopify.dev/docs/storefronts/themes/store/requirements, retrieved 2026-09-22 through Shopify Dev MCP; re-check the page before any submission).** The R8 gate maps each to a check and records the skeleton's status:
    - Features: Sections Everywhere; discounts (cart and order); accelerated checkout buttons on product and cart pages (enabled by default, branded colors unmodified); faceted search filtering on collection and search pages; gift card template; image focal points; social sharing image (`page_image`); country/currency and language selectors per UX guidelines; multi-level menus; newsletter forms; pickup availability on the product page; related and complementary product recommendations; rich product media (3D, video, YouTube/Vimeo) in product, featured product, and quick-view forms; search template with predictive search; selling plans in the cart; Shop Pay Installments banner on the product page.
    - Product page: untruncated title, price, unit price, compare-at price, description, option names and values; all images viewable and mixed ratios do not break layout; variant image shown on selection; tax-included notice; separate option selectors, quantity, add to cart, price/sold-out updates, first available variant loaded; gift card recipient form (`form.email`, `form.name`, `form.message`, `send_on`); swatches (`swatch.image`, `swatch.color`); product main section built from blocks, with `@app` blocks in the main product and featured product sections and Custom Liquid blocks.
    - Cart page: line item title, unit price, image, final price, quantity, options; total; tax-included notice; checkout button; all lines refresh on quantity change; empty message; cart notes, selling plans, automatic discounts, accelerated checkout.
    - Other templates: page title and content plus a contact template; blog title, article title/image/excerpt with pagination; article title, comments (paginated, work without moderation, messages shown), `published_at`; search no-results message, mixed object types via `object_type`, pagination; 404 message and a way forward; gift card page with Apple Wallet, code, QR code at least 120×120 px, logo or shop name; password page with logo or shop name, `shop.password_message`, and password entry.
    - Accessibility: full keyboard access including dropdowns; visible focus; alt on all images; unique input IDs with matching labels; valid HTML; contrast 4.5:1 body, 3:1 large text and non-text; focus order matches DOM; touch targets at least 24×24 px; h1–h6 visually distinct. Lighthouse averages: performance ≥ 60, accessibility ≥ 90.
    - Social and settings: social icon set; Open Graph and Twitter card tags; empty social placeholders; clearly named, shallow settings.
    - Demo store: at least one per preset matching its industry and catalog size; authentic content; test payments only; no apps; unaltered `powered_by_link`; `rel="nofollow"` on Shopify-domain links; asset rights.
  - Known gap from earlier work: step 4 removed the unused gift-card recipient branches from `BuyButtons`; a derived theme targeting submission must build the recipient form above.
  - **User's optional listing features:** pending; the user will supply them. They belong to the derived-theme catalog (chosen per theme), not to the skeleton inventory.

Decided (Claude, at the user's discretion 2026-09-22): **no Playwright.** Browser automation was removed earlier because it only worked inside a native agent browser, and a real storefront run needs store access; the fixed manual checklist in R3 covers the need. Revisit only if R7's Lighthouse CI store exists and a scripted flow becomes cheap.

Checked and not worth doing: minifying `tailwind.output.css` saves about 1 KB gzipped (15.6 KB → 14.5 KB) and still leaves the raw file above the 100,000-byte `AssetSizeCSS` limit (see R7).

## Deferred ideas

- GSAP documentation Skills stay pinned as recorded in each skill's `UPSTREAM.md`; their descriptions do not override the native ordinary-motion policy. Runtime libraries are vendored only for accepted consumers.
- Tailwind's fixed source vocabulary and the generated stylesheet name are revisited only for a concrete workflow need. Theme Block scope, image/video behavior, and the page/Section/Block layout protocol are future feature work.
- Verify Shopify Dev MCP and Context7 availability when a task needs them.

## Closed decisions relevant to scope

- Color scheme classes are merchant-driven and retained; the CSS reference owns their token contract.
- Ordinary section reveal uses the native motion protocol; the motion reference owns the contract.
- Existing evidence/source rules are kept; no separate dated-evidence Skills rule.
- The accepted storefront primitives are listed in `AGENTS.md`; design-specific behavior belongs to derived themes.
