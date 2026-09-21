# Motion Architecture Reference

This reference stores motion decision boundaries that are too long for `AGENTS.md`. `AGENTS.md` remains the rule source. Read this file only when changing animation, transitions, GSAP choreography, motion policy, motion tokens or presets, reduced-motion behavior, or motion cleanup.

Inspect current source for exact selectors, timing values, observer tuning, and runtime internals.

## Motion Goals

1. Preserve one semantic entry point for motion decisions.
2. Keep animation reusable without forcing every animation into one technology.
3. Make future global motion settings possible without scattering raw duration/ease/transform values.
4. Prevent Alpine, Tailwind/CSS, and GSAP from competing for the same element properties.

## Ownership

| Layer | Owns | Does not own |
| --- | --- | --- |
| CSS capability (`tailwind.animates.css`) | Tokens, keyframes, animation classes, native reveal CSS, reduced-motion and motion-disabled kill rules | Section business structure, trigger logic, state management |
| Alpine components | UI state, trigger behavior, open/close/show/hide/active/loading visibility, scoped reveal lifecycle wiring | Animation keyframes, animation values |
| GSAP / ScrollTrigger | Complex narrative choreography: timeline, parallax, scrub, split text, coordinated storytelling | Ordinary content/media reveal |

## Decision Rules

| Motion need | Default path | Do not |
| --- | --- | --- |
| Hover/focus, loader, decorative loop, pause/running | CSS capability utility | GSAP |
| Open/close, show/hide, active/inactive, loading visibility | Alpine state + direct CSS/state classes when needed | GSAP, restored `motion-transition` |
| Ordinary section reveal | Native Intersection Observer adapter in `motion-reveal-section.js` + CSS rules gated on runtime state | GSAP |
| Complex narrative choreography | GSAP only after explicit classification and approval | — |

## Motion Setting Boundary

The mother template retains exactly one merchant-facing motion setting: `motion_enabled`.

`body[data-motion-enabled='false']` gates page and brand motion: section reveal, media reveal, scroll motion, and approved narrative choreography.

Do not use `body[data-motion-enabled='false']` as a blanket kill switch for hover, focus, dropdown, dialog, drawer, loading, or other state/micro interactions. Those interactions must respect `prefers-reduced-motion`.

State and micro interactions must still respect `@media (prefers-reduced-motion: reduce)`.

Derived themes own reveal style, speed tiers, and once-versus-always behavior. The mother template ships one restrained native rise reveal.

## Conflict Rule

Alpine/CSS and GSAP must not control `opacity` or `transform` on the same element. Choose one ownership path per element.

## Ordinary Reveal Contract

### Public protocol (authored Liquid only)

| Attribute | Role |
| --- | --- |
| `data-motion-section` | Lifecycle root; adapter mount and scope boundary |
| `data-motion-reveal` | Target marker, **no value** |
| `data-motion-critical` | First-viewport opt-out; keeps LCP-adjacent content visible |

`data-motion-enabled` on `body` projects the retained `motion_enabled` setting. It is not an independent protocol member.

Section roots mount the adapter:

```liquid
x-data="motionRevealSection()"
data-module-id="motion-reveal-section"
data-motion-section
```

Targets use a valueless `data-motion-reveal`. Stagger order is derived from DOM order inside each scoped root; the adapter sets `--motion-index`.

### Runtime-private attributes (never in Liquid)

| Attribute | Role |
| --- | --- |
| `data-motion-state` | `pending` or `revealed` |
| `data-motion-resetting` | Reserved for derived themes that need silent reset |
| `data-motion-staging` | Reserved for derived themes that need staging without transition |
| `data-motion-critical-runtime` | Runtime mirror for critical handling |

### Activation rule

CSS must never hide an authored motion target by itself. Hiding is allowed only when a selector also requires a runtime state attribute such as `[data-motion-state='pending']`.

`lint:theme` enforces this rule on `tailwind/**/*.css`.

### Mechanism

1. HTML renders targets visible by default.
2. On mount, the adapter in `assets/motion-reveal-section.js` observes owned `[data-motion-reveal]` nodes inside `[data-motion-section]`.
3. When motion is allowed, the adapter sets `data-motion-state="pending"` then flips to `revealed` on intersection.
4. CSS in `tailwind/tailwind.animates.css` applies the restrained default rise transition only after `data-motion-state` appears.
5. On unmount, observers disconnect and runtime attributes plus inline stagger indices are cleared.

Ordinary reveal imports neither GSAP nor ScrollTrigger.

### Footer scroll-to-top

`footer-scroll-top.js` owns `scrollToTop()` independently of the reveal adapter. Do not fold navigation behavior back into `motionRevealSection()`.

## Drawer And Overlay Motion

The mother template ships no drawer or dialog overlay. Derived themes that add one own its motion under the existing `prefers-reduced-motion` policy and must not rely on removed drawer infrastructure from this repository.

## Motion Hook Ownership

- Media primitives such as `snippets/image.liquid` may own valueless `data-motion-reveal` internally by default.
- Stable content components may own internal `data-motion-reveal` hooks for their own stable regions.
- Layout, control, form, drawer, dialog, filter, search, cart, pagination, and button/link primitives should not output reveal hooks by default.
- Sections own the reveal root and broad content grouping hooks.
- Conversion-critical controls and merchant-owned custom content should not be reveal targets by default.

## GSAP Boundary

The current theme has no active GSAP runtime or project consumers. Do not reintroduce GSAP during ordinary motion cleanup.

GSAP remains an explicitly approved future option only for complex narrative choreography. If approved again, register factories through `define()` on a `data-module-id` entry module, scope triggers to the component root, clean up in `destroy()`, respect reduced motion, and keep no-JS critical content visible.

## Page-Type Policy

Conversion pages such as product, collection, search, cart, and checkout-adjacent flows should use restrained motion: state transitions, interaction feedback, media controls, and below-the-fold reveal only.

Home, brand, editorial, campaign, and storytelling pages may use richer choreography when no critical first-viewport content is hidden before JavaScript, no LCP candidate waits for animation, reduced motion is respected, and keyboard and screen-reader access remain intact.

## Token And Preset Rules

Do not over-tokenize motion. Tokens are for shared foundation values reused across multiple recipes or expected to be affected by global motion settings. Component-specific values stay inside the owning recipe until a real reuse pattern exists.

Merchant-facing motion settings should control policy, not low-level implementation details such as GSAP easing names, ScrollTrigger start/end positions, or raw stagger amounts.

## Migration And Duplication

Motion cleanup must be staged:

1. Audit current motion usage before refactoring.
2. Group findings as CSS capabilities, Alpine/state recipes, GSAP/choreography, and mixed-ownership risks.
3. Keep `motion-transition` removed.
4. Build ordinary reveal around the public protocol, the native adapter, and CSS gated on runtime state.
5. Preserve visual behavior unless the task explicitly asks to redesign motion.

Before adding another copy of a motion pattern, inspect whether an existing capability utility, reveal hook, or approved runtime contract already owns it.

## Performance And Reduced Motion

- Prefer opacity and transform for visual motion; avoid layout-changing animation properties.
- Critical first-viewport content must render visible without JavaScript or animation completion.
- Do not hide critical first-viewport content behind GSAP, Alpine, Swiper initialization, delayed transitions, `opacity-0`, `hidden`, `x-show="false"`, off-screen transforms, or callbacks.
- Reduced motion and `body[data-motion-enabled='false']` must leave content visible and must not break UI state such as `x-show`.
- Shared observers, timers, listeners, or animation runtimes must be cleaned up through the owning component lifecycle.
