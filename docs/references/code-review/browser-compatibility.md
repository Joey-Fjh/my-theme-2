# Browser Compatibility Policy

Static compatibility baseline and guardrails. `AGENTS.md` remains the rule source.

## Official Support Baseline

Follow the current [Shopify Theme Store browser compatibility requirements](https://shopify.dev/docs/storefronts/themes/store/requirements#9-browser-compatibility):

This project adopts that browser matrix as a quality baseline only. It does not adopt the Theme Store storefront feature inventory into the Skeleton mother template.

- Safari: latest two macOS releases
- Chrome: latest three releases on macOS and Windows
- Firefox: latest three releases on macOS and Windows
- Edge: latest two Windows releases
- Mobile Safari: latest two iOS releases
- Chrome Mobile: latest three releases on Android and iOS
- Samsung Internet: latest two Android releases
- Instagram, Facebook, and Pinterest webviews: latest Android and iOS releases

## Build Boundary

The runtime architecture remains Liquid, Tailwind CSS v4 CLI, classic deferred scripts, and Alpine.

Tailwind CSS v4 handles imports and vendor prefixes and targets modern browsers. Browserslist does not change Tailwind's compilation target. Do not add Vite, Autoprefixer, Babel, or broad polyfill bundles solely for this policy.

If Shopify's required browser range ever becomes older than Tailwind's supported floor, stop and make an explicit architecture decision instead of silently layering another transformer over generated CSS.

## Static Tool Scope

`.browserslistrc` drives the browser range for static ESLint and Stylelint compatibility checks only.

Static lint can express source-detectable browser support for first-party CSS, JS, and embedded Liquid stylesheet/javascript blocks. It cannot prove complete browser compatibility.

The following remain release-test responsibilities, not static lint guarantees:

- iOS Chrome behavior
- Instagram, Facebook, and Pinterest in-app webviews
- Pixel-identical rendering and browser-engine defects not represented in source scans

## Commands

- `npm.cmd run lint:compat` — static compatibility scan for first-party CSS, JS, and embedded Liquid stylesheet/javascript blocks.
- `npm.cmd run lint:compat:embedded` — embedded Liquid block scan; invoked by `lint:compat`.
- `npm.cmd run scan:compat` — rebuild Tailwind output, then run compatibility checks. Use after Tailwind source changes.

Detailed allowlists and generated-artifact rules live in lint source and config, not in this reference.

## Source Adoption Rules

- Prefer MDN Baseline widely available features.
- A newer feature is allowed only when every Shopify-required browser supports it or a usable fallback precedes it.
- Use `@supports` for optional visual enhancement when the fallback must remain usable.
- Prefer feature detection over user-agent detection.
- Keep critical navigation, product forms, and purchase paths usable without JavaScript.

## Project WebKit Guardrail

The architecture lint enforces one deterministic SVG regression already confirmed in Safari:

- SVG `<text textLength>` must not contain nested `<tspan>` nodes.

When a future browser defect has a stable source signature and a low false-positive rate, add a similarly narrow guard to `lint:theme` rather than reviving theme-specific class rules.

## Evidence Boundary

Passing static checks means the configured tools found no unapproved source-detectable incompatibility for the represented browser matrix. It does not prove complete database coverage, pixel-identical rendering, application-webview support, or the absence of browser-engine implementation defects.

Automated browser, BrowserStack, real-device, and application-webview testing remain required before a Theme Store submission claim of full browser verification.
