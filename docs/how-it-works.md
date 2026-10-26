# How Site Recon works

Site Recon combines an agent playbook with a deterministic Playwright inspector. The script collects browser facts; the agent interprets those facts, checks the visible experience, and writes the implementation report.

## Three browser profiles

Every automated run opens the page three times:

1. Desktop at 1440 × 1000
2. Mobile at 390 × 844
3. Desktop with `prefers-reduced-motion: reduce`

Comparing those runs exposes responsive asset choices, changes in animation counts, mobile composition differences, and whether motion is actually disabled for people who request it.

## Evidence collected

The inspector records:

- final URL, title, language, metadata and headings;
- scripts, stylesheets, fonts and public resource timing;
- selected response headers and hosting/CDN clues;
- CSS keyframes and animation declarations available through the CSS object model;
- active Web Animations API records from `document.getAnimations()`;
- target selectors, duration, delay, easing, iteration, direction and keyframes;
- canvases, interactive elements and console errors;
- framework and animation-library signatures from resources already delivered to the browser;
- short surrounding excerpts for those signatures;
- advertised source-map references, without fetching third-party maps.

It does not submit forms, bypass authentication, probe private endpoints, or attempt to recover server code.

## Confidence levels

- **Verified:** directly visible in a delivered asset, runtime API, header or supplied source tree.
- **Strongly inferred:** several independent browser signals agree.
- **Possible:** an ambiguous clue that should not lead the report.
- **Unknown:** not exposed by the browser surface.

The distinction matters. Nuxt asset paths and `__NUXT__` data verify Nuxt. A generic root element does not prove React. A filename containing a common English word does not prove a library.

## False-positive controls

Signal detectors use library-specific markers instead of broad keyword matches. Regression tests cover mistakes found during real inspections, including Vue's “reactive” internals being mistaken for React and the phrase “all three.” being mistaken for the `THREE.` JavaScript namespace.

## Owner mode

When the user owns the site and supplies its repository, the agent also checks dependency manifests, imports, build configuration and source files. This distinguishes code that is installed from code that is actually used in the deployed path.
