# Case study: Kigo Studio

Kigo Studio was the first unrelated production site used to validate Site Recon. It is visually rich, responsive, and animation-heavy, making it a useful test beyond the creator's own portfolio.

## What the final run found

- Nuxt assets and runtime data
- Vue runtime and scoped-style markers
- GSAP with ScrollTrigger
- Netlify hosting and responsive image delivery
- 18 browser-visible CSS keyframe families
- SVG blossoms and buds revealed through staggered scale and opacity
- ambient petals with independent 23–31 second falls and 6 second alternating sway
- calligraphic SVG stroke drawing
- hover and keyboard-focus pulses
- a hero canvas
- no active animations in the reduced-motion profile
- no advertised source maps

## What the first run got wrong

The initial detector also reported React and Three.js. Both were false positives:

- Vue bundle text contains words such as “reactive”; a broad `react` expression matched it.
- Page copy included the phrase “all three.”; a case-insensitive expression treated it like the `THREE.` global namespace.

The detector was tightened to require React-specific runtime markers and case-sensitive or filename-specific Three.js evidence. Both mistakes are now permanent regression tests.

## Rebuild lesson

The recognizable experience does not depend on copying Kigo's illustrations or production bundle. Its motion grammar can be described independently:

- populate ambient particles immediately with negative delays;
- separate vertical fall from local sway and rotation;
- vary durations within a controlled range;
- animate SVG groups with staggered scale and opacity;
- reserve scroll-linked tooling for effects that truly depend on scroll;
- remove continuous motion when reduced motion is requested.

Site Recon includes an original React/CSS petal-field component demonstrating those principles with new markup and artwork.
