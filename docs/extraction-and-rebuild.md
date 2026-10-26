# Extraction and clean-room rebuilding

The browser downloads real executable code, but production output is not the same thing as the original source tree. Site Recon separates what can be extracted exactly from what must be reconstructed.

## Extraction artifacts

Run the inspector with `--artifacts-dir` to create:

| File | Purpose |
| --- | --- |
| `observed-keyframes.css` | Exact keyframes exposed by the browser's CSS object model |
| `technique-evidence.json` | Stack evidence, applied animation rules, runtime animations, fonts, canvases, bundle excerpts and source-map references |
| `asset-manifest.json` | Public resources with initiator type, transfer size and timing |
| `rebuild-brief.md` | An implementation sequence that keeps evidence separate from new code |

The complete `report.json` retains the three viewport runs and lower-level observations.

## What survives compilation

CSS selectors, keyframe values, public asset URLs and many runtime timing values usually survive intact. Library names, GSAP plugin strings and Vue scoped-style markers may also remain searchable.

Original component filenames, comments, TypeScript types, clear variable names and module boundaries often do not survive. A prettified bundle may be readable enough to understand a mechanism but should not be presented as recovered authoring source.

## Rebuild workflow

1. Identify the effect's target, trigger and state changes.
2. Record exact observable timing and easing values.
3. Separate functional behavior from brand expression and authored artwork.
4. Implement the behavior with new component structure, names and assets.
5. Tune the effect to the destination design instead of cloning the source composition.
6. add keyboard-equivalent behavior and reduced-motion handling.
7. Compare the result at desktop and mobile sizes.

The included `assets/rebuild/react/PetalField.jsx` demonstrates this approach. It uses the general idea of independently timed falling and swaying particles, but its SVG, component code, naming and CSS are original.

## Source maps

The inspector reports source-map references found in delivered bundles. It does not automatically fetch third-party maps. Source maps can expose original filenames and source text, so use them only for a site you own, a repository with a compatible license, or work you are explicitly authorized to inspect.
