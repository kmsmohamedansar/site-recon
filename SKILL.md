---
name: site-recon
description: Inspect a public website or a site the user owns to identify its frontend stack, fonts, assets, layout system, animation techniques, 3D/WebGL usage, interaction patterns, accessibility behavior, and likely implementation details. Use this skill whenever a user asks what a website is built with, how a site's animations work, to reverse-engineer a portfolio or landing page, to recreate a site's behavior, or to produce an evidence-backed implementation brief from a URL. Prefer clean-room reproduction and never imply access to private source or server code.
license: MIT
---

# Site Recon

Analyze the website a normal visitor can load, explain what is verifiable versus inferred, and turn the findings into an original implementation plan. The point is to understand techniques—not to misrepresent guesses as source recovery or to duplicate protected identity and content.

## Choose the inspection mode

Use **owner mode** when the user owns the site or supplies its repository. Inspect both the live page and source tree, and distinguish deployed behavior from unused dependencies.

Use **public mode** for third-party sites. Inspect only resources delivered to an ordinary browser. Do not bypass authentication, paywalls, bot protection, access controls, or security warnings. Do not probe private endpoints or submit forms.

If ownership is unclear, public mode is the safe default. A user saying “my site” is sufficient to use owner mode for the named site; ask for the source path only if source-level analysis would materially improve the requested result.

## Workflow

### 1. Define the target and requested depth

Capture:

- the exact URL and important routes or states;
- whether the user wants analysis only, a reproduction plan, or working code;
- target framework if they want a rebuild;
- whether source code is available locally;
- desktop/mobile coverage and any particular interactions to study.

Proceed with sensible defaults when those details are not material: homepage, desktop plus mobile, analysis plus implementation recipe, framework-neutral examples.

### 2. Establish live-page evidence

Open the site in a real browser when available. Record the final URL, page title, viewport, visible sections, navigation, overlays, and loading behavior. Capture desktop and mobile screenshots when visual comparison matters.

Use the bundled inspector when Playwright is installed:

```bash
node scripts/inspect-site.mjs https://example.com --out site-recon.json
```

When the user wants implementation evidence or a rebuild, also write the extraction bundle:

```bash
node scripts/inspect-site.mjs https://example.com \
  --out site-recon.json \
  --artifacts-dir site-recon-artifacts
```

The artifact directory contains browser-observed keyframes, an animation and bundle-evidence ledger, a public asset manifest, and a clean-room rebuild brief. Exact observed CSS is evidence, not automatic permission to republish it.

Run it from this skill directory, or use its absolute path. If Playwright or browser automation is unavailable, use the agent's browser tools and continue manually. Never block the entire analysis because one inspection route is unavailable.

For owner mode with a local repository, also inspect dependency manifests, build configuration, entry points, imported animation libraries, CSS keyframes, requestAnimationFrame loops, canvas/WebGL code, IntersectionObserver usage, and reduced-motion handling.

### 3. Build an evidence ledger

Classify every important finding:

- **Verified** — directly observed in delivered markup, CSS, runtime APIs, asset names, headers, or supplied source.
- **Strongly inferred** — multiple independent signals support it, but the exact source is unavailable.
- **Possible** — a weak or ambiguous signal; keep this out of the executive summary.
- **Unknown** — not knowable from the browser surface, especially backend language, CMS internals, original design tooling, or unshipped source.

Never say a minified bundle proves the site's original file structure. Do not infer a backend language from a frontend framework alone.

### 4. Inventory the implementation

Inspect and report:

- framework/runtime, bundler, hosting/CDN signals, and routing style;
- component and page structure visible in the DOM;
- typography, color tokens, spacing rhythm, grids, breakpoints, and responsive changes;
- image, SVG, icon, video, font, model, shader, and canvas assets;
- CSS animations and transitions, including keyframe names, properties, duration, delay, easing, iteration count, and trigger;
- Web Animations API instances from `document.getAnimations()`;
- animation libraries and signatures such as Motion/Framer Motion, GSAP, Lottie, Lenis, Three.js, React Spring, anime.js, or native CSS/Canvas;
- scroll reveals, sticky sections, parallax, pointer-following, magnetic controls, marquees, route transitions, loaders, 3D scenes, and shader effects;
- hover, focus, keyboard, pointer, scroll, and reduced-motion variants;
- performance characteristics that affect the effect, such as GPU-friendly transforms, heavy filters, continuous render loops, and large media.

Treat package names found in source as definitive only when they are imported or used in the relevant deployed path. A dependency list alone may include dead code.

### 5. Describe each motion as a reproducible recipe

For every meaningful animation, explain:

1. **Where it appears** — section and target element.
2. **Trigger** — load, viewport entry, scroll progress, pointer, hover, click, route change, timer, or application state.
3. **Motion** — properties and approximate start/end values.
4. **Timing** — duration, delay/stagger, easing or spring parameters, and repetition.
5. **Mechanism** — CSS, Web Animations API, animation library, Canvas 2D, WebGL/Three.js, or custom requestAnimationFrame loop.
6. **Responsive/accessibility behavior** — mobile changes and `prefers-reduced-motion` handling.
7. **Clean-room recipe** — concise original pseudocode or code pattern that reproduces the technique without copying protected expression.

When exact numeric values are observable, use them. When values are visually estimated, label them approximate.

### 6. Extract implementation evidence when requested

Use `--artifacts-dir` when the user asks for actual code, exact values, or material they can implement. Review these outputs:

- `observed-keyframes.css` contains exact CSS keyframes exposed to the browser;
- `technique-evidence.json` connects selectors, runtime keyframes, timings, library signals, source-map references, fonts, and canvases;
- `asset-manifest.json` lists browser-loaded public resources and transfer sizes;
- `rebuild-brief.md` turns the evidence into an original implementation sequence.

The inspector also records short, targeted excerpts around framework/library signatures that survive bundling. Use them to understand mechanisms, not as replacement source files. A production bundle is compiled output: component names, comments, types, module boundaries, and design intent may be lost.

If a bundle advertises a source map, report the reference. Do not fetch or use a third-party source map as a shortcut to unpublished source. In owner mode, it may be inspected when the user owns the deployment or explicitly supplies authorization.

### 7. Produce the report

Read [references/report-template.md](references/report-template.md) and follow it. Keep raw asset lists in an appendix; lead with the findings a builder can act on.

Include evidence beside claims: URLs, selectors, CSS rule names, runtime animation records, bundle identifiers, or source file paths and line numbers. Avoid dumping minified source into the report.

### 8. Reproduce responsibly when requested

Read [references/legal-and-safety.md](references/legal-and-safety.md) before generating a clone or implementation.

Default to a **clean-room recreation**:

- preserve the interaction idea and motion grammar;
- write original components and styling;
- replace names, copy, logos, illustrations, photography, and distinctive assets;
- avoid pixel-for-pixel duplication of a third-party site's complete composition;
- cite libraries and licenses when code or assets are permissively licensed.

For a user-owned site or code under a compatible license, direct reuse may be appropriate. State which source or license authorizes it and preserve required notices.

For React rebuilds involving drifting ambient particles or petals, the original starter in `assets/rebuild/react/` is available as a base. Adapt its shape, palette, density, timing, and composition to the destination site; do not combine it with a third party's artwork or brand treatment.

## Output quality checks

Before finishing, verify that:

- claims are labeled by confidence;
- frontend and backend conclusions are not conflated;
- the animation inventory includes triggers and reduced-motion behavior;
- the report separates observed facts from recommendations;
- code examples are original or license-compatible;
- inaccessible or blocked evidence is reported as a limitation rather than guessed;
- the result is detailed enough that another developer can implement the behavior.

