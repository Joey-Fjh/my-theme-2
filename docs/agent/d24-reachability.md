# D24 reachability closure

Read-only render-graph analysis for the D20/D24 kept inventory. Generated 2026-09-18.

## Method

- Collected static render edges from `{% render %}`, `{% include %}`, `{% section %}`, `{% sections %}`, and section-group JSON membership across `layout/`, `sections/`, `snippets/`, `blocks/`, and `templates/*.liquid`.
- Also matched `render` / `include` inside `{%- liquid -%}` blocks (required for `quantity-constraints` and gallery layout branches).
- **Table 1 `reachable`:** `yes` only when a retained-only path exists from a **retained section or retained section group** root. Paths through cut files do not count.
- `layout/theme.liquid` is scanned for edges and discussed in Section 4, but is **not** a Table 1 root — the inventory batch rewrites section compositions, not layout infrastructure.

## Table 1 — kept file reachability

| file | tier | reachable | path | via-cut-only | proposed disposition |
| --- | --- | --- | --- | --- | --- |
| buy-buttons | Tier 1 | no | NONE | snippet/product-info-blocks, snippet/quick-view-buy-actions | needs a host |
| country-localization | Tier 1 | no | NONE | section/announcement-bar | needs a host |
| css-variables | Tier 1 | no | NONE | n/a | needs a host |
| image | Tier 1 | yes | section/footer → snippet/image | section/about-stats, section/before-after-comparison, section/blog-stories, section/brand-statement, section/featured-product, section/main-page-about, section/newsletter-banner, section/newsletter-overlay, section/philosophy-section, section/product-comparison-table, section/promise-section, section/promo-bannder, section/routine-showcase, section/scroll-categories, section/slides-show, section/testimonial-featured, section/video-banner, snippet/grid-feature-card, snippet/image-lightbox, snippet/image-magnifier, snippet/product-card, snippet/product-gallery-carousel, snippet/product-gallery-grid, snippet/product-gallery-stacked, snippet/product-gallery-thumbnails | keep as is |
| language-localization | Tier 1 | no | NONE | section/announcement-bar | needs a host |
| localization-option | Tier 1 | no | NONE | n/a | needs a host |
| localization-selected-icon | Tier 1 | no | NONE | n/a | needs a host |
| localization-switcher | Tier 1 | no | NONE | n/a | needs a host |
| meta-tags | Tier 1 | no | NONE | n/a | needs a host |
| pagination | Tier 1 | yes | section/collections → snippet/pagination | snippet/search-results-tabs | keep as is |
| product-tax-note | Tier 1 | yes | section/cart → snippet/product-tax-note | snippet/product-info-blocks, snippet/product-purchase-stack | keep as is |
| product-variant-picker | Tier 1 | no | NONE | snippet/product-info-blocks, snippet/product-purchase-stack | needs a host |
| quantity-constraints | Tier 1 | yes | section/cart → snippet/quantity-selector → snippet/quantity-constraints | section/cart-overlay | keep as is |
| quantity-selector | Tier 1 | yes | section/cart → snippet/quantity-selector | snippet/product-info-blocks | keep as is |
| unit-price | Tier 1 | yes | section/cart → snippet/unit-price | snippet/product-card-price | keep as is |
| accordion | Tier 2 | no | NONE | section/promise-section, snippet/filters-groups | needs a host |
| icons | Tier 2 | yes | section/404 → snippet/icons | section/about-stats, section/announcement-bar, section/before-after-comparison, section/blog-stories, section/cart-overlay, section/category-grid, section/featured-products, section/google-map, section/newsletter-banner, section/newsletter-overlay, section/philosophy-section, section/pickup-availability, section/promo-bannder, section/promotion-countdown, section/routine-showcase, section/scroll-categories, section/search-overlay, section/slides-show, section/video-banner, snippet/active-filters, snippet/cart-summary-accordion, snippet/content-icon, snippet/filter-horizontal, snippet/filters-drawer, snippet/grid-feature-card, snippet/header-dropdown-super-menu, snippet/header-mobile-menu-drawer, snippet/image-lightbox, snippet/predictive-search-product-card, snippet/product-card, snippet/product-gallery-thumbnails, snippet/product-info-blocks, snippet/product-info-share, snippet/product-media-modal, snippet/product-purchase-stack, snippet/search-predictive-panel, snippet/search-results-tabs, snippet/show-more-icon, snippet/social-icons, snippet/starts | keep as is |
| link | Tier 2 | yes | section/404 → snippet/link | section/about-stats, section/announcement-bar, section/blog-stories, section/cart-overlay, section/category-grid, section/philosophy-section, section/promo-bannder, section/promotion-countdown, section/routine-showcase, section/scroll-categories, section/slides-show, snippet/header-dropdown-super-menu, snippet/header-mobile-menu-drawer, snippet/social-icons | keep as is |
| loading | Tier 2 | yes | section/blog → snippet/loading | section/search-overlay, snippet/search-predictive-panel, snippet/search-results-tabs | keep as is |
| rte-compact-prose | Tier 2 | no | NONE | snippet/listing-page-hero-copy, snippet/product-recommendations-section | needs a host |
| tab-control | Tier 2 | yes | section/blog → snippet/tab-control | section/featured-products, section/search-overlay, snippet/header-dropdown-super-menu, snippet/search-predictive-panel | keep as is |
| ui-dialog | Tier 2 | yes | section/collection → snippet/ui-dialog | section/cart-overlay, section/newsletter-overlay, section/search-overlay, snippet/header-mobile-menu-drawer, snippet/product-card, snippet/search-results-tabs | keep as is |
| ui-toast | Tier 2 | no | NONE | n/a | needs a host |
| filter-vertical | cluster survivor | yes | section/collection → snippet/filter-vertical | n/a | keep as is |
| filters-field | cluster survivor | no | NONE | snippet/filter-horizontal, snippet/filters-groups | needs a host |
| header-dropdown-menu | cluster survivor | yes | section/header → snippet/header-dropdown-menu | n/a | keep as is |
| media-video | cluster survivor | no | NONE | section/video-banner | needs a host |
| product-gallery | cluster survivor | yes | section/product → snippet/product-gallery | section/featured-product, snippet/product-quick-view | keep as is |
| product-media | cluster survivor | no | NONE | snippet/product-gallery-carousel, snippet/product-gallery-grid, snippet/product-gallery-stacked, snippet/product-gallery-thumbnails | needs a host |
| sort-by-dropdown | cluster survivor | yes | section/collection → snippet/sort-by-dropdown | n/a | keep as is |
| 404 | retained section | yes | section/404 | n/a | keep as is |
| article | retained section | yes | section/article | n/a | keep as is |
| blog | retained section | yes | section/blog | n/a | keep as is |
| cart | retained section | yes | section/cart | n/a | keep as is |
| collection | retained section | yes | section/collection | n/a | keep as is |
| collections | retained section | yes | section/collections | n/a | keep as is |
| custom-liquid | retained section | yes | section/custom-liquid | n/a | keep as is |
| footer | retained section | yes | section/footer | n/a | keep as is |
| header | retained section | yes | section/header | n/a | keep as is |
| main-page-contact | retained section | yes | section/main-page-contact | n/a | keep as is |
| page | retained section | yes | section/page | n/a | keep as is |
| password | retained section | yes | section/password | n/a | keep as is |
| product | retained section | yes | section/product | n/a | keep as is |
| search | retained section | yes | section/search | n/a | keep as is |
| footer-group.json | retained section group | yes | group/footer-group | n/a | keep as is |
| header-group.json | retained section group | yes | group/header-group | n/a | keep as is |

## Table 2 — orphan resolutions

| file | resolution | owner | rationale |
| --- | --- | --- | --- |
| buy-buttons | **host it** | `product` | Minimal product rewrite must render purchase actions directly; today the only path is cut `product-info-blocks`. |
| country-localization | **host it** | `header` | Accepted inventory correction: move selectors into a retained global shell section before deleting cut `announcement-bar`. |
| css-variables | **host it** | `layout/theme.liquid` (infrastructure) | Global token bridge is layout infrastructure; already rendered in `layout/theme.liquid` and `layout/password.liquid` — preserve, not a section orphan. |
| language-localization | **host it** | `header` | Same chain as country selector; `header` is the agreed owner. |
| localization-option | **host it** | `header` | Rendered only by the localization entry snippets; becomes reachable when those are hosted in `header`. |
| localization-selected-icon | **host it** | `header` | Used inside `localization-option`; no separate section work beyond the header localization move. |
| localization-switcher | **host it** | `header` | Shared wrapper for both selectors; hosted transitively from `country-localization` / `language-localization`. |
| meta-tags | **host it** | `layout/theme.liquid` (infrastructure) | SEO head tags belong in layout; already rendered — preserve during inventory batch. |
| product-variant-picker | **host it** | `product` | Variant selection belongs to the accepted retained product baseline; the minimal `product` section must render this snippet after `product-info-blocks` is removed. |
| accordion | **host it** | `cart` and `filter-vertical` | `cart-summary-accordion` inlines duplicate accordion behavior; minimal cart rewrite should render the kept snippet. `filter-vertical` rewrite (replacing cut `filters-groups`) also needs `accordion` for filter panels. |
| rte-compact-prose | **host it** | `blog` / `collection` / `page` | Replace cut `listing-page-hero-copy` usage in minimal listing/page compositions with direct `rte-compact-prose` renders. |
| ui-toast | **host it** | `layout/theme.liquid` (infrastructure) | Already rendered at `layout/theme.liquid:109`; not section-reachable but layout is the correct permanent host for global toast UI. |
| filters-field | **host it** | `filter-vertical` | Cluster survivor rewrite must render `filters-field` directly instead of cut `filters-groups`. |
| media-video | **cut** | n/a | Not used by kept `product-media` (video preview is handled inline). Only cut `video-banner` renders this snippet; no accepted retained-scope loss follows from cutting this separate renderer. |
| product-media | **host it** | `product-gallery` | Minimal gallery layout must include one retained layout branch that renders `product-media` for all Shopify media types. |

## Table 3 — accepted retained-capability check

| capability | implementation | reachable | path / blocker |
| --- | --- | --- | --- |
| Cart page / line items | section/cart + snippets/quantity-selector, unit-price, product-tax-note | yes | section/cart → snippet/quantity-selector (+ quantity-constraints transitively) (ok) |
| Product variant selection | snippets/product-variant-picker, buy-buttons | no | NONE — blocked by cut `product-info-blocks` (**D24 REACHABILITY BLOCKER**) |
| Quantity rules | snippets/quantity-selector, quantity-constraints | yes | section/cart → snippet/quantity-selector → snippet/quantity-constraints (ok) |
| Pagination | snippet/pagination | yes | section/collections → snippet/pagination (also article, blog) (ok) |
| Unit price display | snippet/unit-price | yes | section/cart → snippet/unit-price (ok) |
| Country / language selection | localization snippet chain (5 files) | no | NONE — blocked by cut `announcement-bar` (**D24 REACHABILITY BLOCKER**) |
| Product media (incl. video) | snippets/product-gallery, product-media | partial | section/product → snippet/product-gallery is reachable, but `product-media` is not — gallery still depends on cut layout branches (**PARTIAL BLOCKER**) |

## Section 4 — findings

### Seeded defect rediscovery

| kept file | section-reachable | independent finding |
| --- | --- | --- |
| `accordion` | no | Only `section/promise-section` and `snippet/filters-groups` render it; both are cut. `cart-summary-accordion` duplicates behavior inline without rendering the snippet. |
| localization chain (5 snippets) | no | Only `section/announcement-bar` renders `country-localization` / `language-localization`; `announcement-bar` is cut. |
| `ui-toast` | no (section closure) | **Correction:** `context.md` states no render call exists; `layout/theme.liquid:109` does render it. It remains section-unreachable; layout is the host. |

### Unresolvable dynamic render edges

| file | line | edge |
| --- | --- | --- |
| `blocks/group.liquid` | 10 | content_for 'blocks' (dynamic block tree) |
| `sections/custom-content.liquid` | 10 | content_for 'blocks' (dynamic block tree) |
| `snippets/product-info-blocks.liquid` | 65 | render block (Theme block variable) |
| `snippets/product-info-blocks.liquid` | 564 | render block (Theme block variable) |

### Kept files reachable only via layout (not Table 1 roots)

| file | layout path |
| --- | --- |
| `css-variables` | `layout/theme.liquid` → `snippet/css-variables` (also `layout/password.liquid:14`) |
| `meta-tags` | `layout/theme.liquid` → `snippet/meta-tags` (also `layout/password.liquid:20`) |
| `ui-toast` | `layout/theme.liquid:109` → `snippet/ui-toast` |

### Retained sections that render cut files

| retained source | cut target | source location |
| --- | --- | --- |
| `section/404` | `snippet/watermark` | `sections/404.liquid:67` |
| `section/article` | `snippet/social-icons` | `sections/article.liquid:119` |
| `section/blog` | `snippet/listing-page-hero-copy` | `sections/blog.liquid:30` |
| `section/blog` | `snippet/rotating-badge` | `sections/blog.liquid:45` |
| `section/cart` | `snippet/cart-summary-accordion` | `sections/cart.liquid:426` |
| `section/collection` | `snippet/filter-horizontal` | `sections/collection.liquid:333` |
| `section/collection` | `snippet/filters-drawer` | `sections/collection.liquid:543` |
| `section/collection` | `snippet/listing-page-hero-copy` | `sections/collection.liquid:178` |
| `section/collection` | `snippet/product-card` | `sections/collection.liquid:500` |
| `section/collection` | `snippet/rotating-badge` | `sections/collection.liquid:196` |
| `section/collections` | `snippet/rotating-badge` | `sections/collections.liquid:42` |
| `section/footer` | `snippet/watermark` | `sections/footer.liquid:133` |
| `section/header` | `snippet/header-dropdown-super-menu` | `sections/header.liquid:105` |
| `section/header` | `snippet/header-mobile-menu-drawer` | `sections/header.liquid:41` |
| `section/main-page-contact` | `snippet/watermark` | `sections/main-page-contact.liquid:231` |
| `section/product` | `snippet/product-info-blocks` | `sections/product.liquid:90` |
| `section/search` | `snippet/search-predictive-panel` | `sections/search.liquid:62` |
| `section/search` | `snippet/search-results-tabs` | `sections/search.liquid:100` |

### Retained roots that reference cut groups or sections

| retained root | cut target | source location |
| --- | --- | --- |
| `layout/theme.liquid` | `group/overlay-group` | `layout/theme.liquid:99` |
| `group/header-group` | `section/announcement-bar` | `sections/header-group.json` (section type) |

The header group still mounts cut `announcement-bar` beside retained `header`. That does not make the localization chain section-reachable (paths through cut nodes are excluded), but it is a template/group dependency that must be rewritten before deletion.

### Retained kept snippets that render cut files (mirror defect)

| retained snippet | cut target | source location |
| --- | --- | --- |
| `snippet/buy-buttons` | `snippet/gift-card-recipient-form` | `snippets/buy-buttons.liquid:131` |
| `snippet/buy-buttons` | `snippet/pickup-availability-inline` | `snippets/buy-buttons.liquid:438` |
| `snippet/buy-buttons` | `snippet/selling-plan-picker` | `snippets/buy-buttons.liquid:123` |
| `snippet/filter-vertical` | `snippet/filters-groups` | `snippets/filter-vertical.liquid:27` |
| `snippet/filters-field` | `snippet/show-more-icon` | `snippets/filters-field.liquid:103` |
| `snippet/product-gallery` | `snippet/image-lightbox` | `snippets/product-gallery.liquid:109` |
| `snippet/product-gallery` | `snippet/product-gallery-carousel` | `snippets/product-gallery.liquid:100` |
| `snippet/product-gallery` | `snippet/product-gallery-grid` | `snippets/product-gallery.liquid:104` |
| `snippet/product-gallery` | `snippet/product-gallery-stacked` | `snippets/product-gallery.liquid:102` |
| `snippet/product-gallery` | `snippet/product-gallery-thumbnails` | `snippets/product-gallery.liquid:98` |
| `snippet/product-gallery` | `snippet/product-media-modal` | `snippets/product-gallery.liquid:118` |
| `snippet/product-media` | `snippet/image-magnifier` | `snippets/product-media.liquid:51` |
| `snippet/product-variant-picker` | `snippet/product-variants-quantity-json` | `snippets/product-variant-picker.liquid:36` |

## Report summary

- **Counts (Table 1):** 31 reachable, 15 unreachable (46 kept files total).
- **Seeded cases:** `accordion`, all five localization snippets, and `ui-toast` each show `reachable = no` under section/group closure. Method independently rediscovered all three defect classes.
- **Accepted retained capabilities unreachable:** product variant selection (`buy-buttons`, `product-variant-picker`); country/language selection (localization chain). Product media is a partial blocker (`product-gallery` reachable, `product-media` not).
- **Retained sections rendering cut files:** 18 direct edges.
- **Retained kept snippets rendering cut files:** 13 direct edges (notably `filter-vertical` → `filters-groups`, `product-gallery` → layout-variant snippets).
- **Unresolvable dynamic edges:** 4.
