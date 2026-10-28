# Site Recon

An open-source agent skill for Codex and Claude Code that inspects the public browser surface of a website, identifies the likely frontend stack, explains its animations in implementation detail, and produces clean-room reproduction recipes.

[![CI](https://github.com/kmsmohamedansar/site-recon/actions/workflows/ci.yml/badge.svg)](https://github.com/kmsmohamedansar/site-recon/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-74200d.svg)](LICENSE)
[![Node 20+](https://img.shields.io/badge/Node-20%2B-101010.svg)](package.json)

Site Recon does not pretend a production bundle is the original source. It records what a normal browser can verify, labels inference, and gives an agent enough evidence to build an original equivalent.

## Documentation

- [Installation](docs/installation.md)
- [How the inspection works](docs/how-it-works.md)
- [Extraction and clean-room rebuilding](docs/extraction-and-rebuild.md)
- [Kigo Studio case study](docs/kigo-case-study.md)
- [Limitations and responsible use](docs/limitations-and-responsible-use.md)
- [Contributing](CONTRIBUTING.md)
- [Security and report sharing](SECURITY.md)

It is designed to answer questions such as:

- “What is this portfolio built with?”
- “How does that scroll reveal or magnetic button work?”
- “Can you recreate the interaction style in React without copying the brand?”
- “Compare my deployed site with its source and find what is really used.”

## Install as a project skill

Copy this directory into either agent's project skill folder:

```bash
# Codex
mkdir -p .agents/skills
cp -R /path/to/site-recon .agents/skills/site-recon

# Claude Code
mkdir -p .claude/skills
cp -R /path/to/site-recon .claude/skills/site-recon
```

The same `SKILL.md` works in both locations.

See [the installation guide](docs/installation.md) for personal installation, invocation examples, and updating.

## Optional automated inspector

The skill can work with an agent's browser tools alone. For deeper, repeatable runtime evidence, install Playwright:

```bash
cd site-recon
npm install
npx playwright install chromium
node scripts/inspect-site.mjs https://example.com \
  --out site-recon.json \
  --artifacts-dir site-recon-artifacts
```

The JSON includes desktop, mobile, and reduced-motion observations, delivered assets, CSS keyframes, active Web Animations API records, fonts, canvases, interactive elements, resource timing, targeted bundle evidence, source-map references, and evidence-based stack signals.

The optional artifact directory contains:

- `observed-keyframes.css` — exact browser-visible keyframes for forensic review;
- `technique-evidence.json` — selectors, timings, runtime animations, stack evidence, and short bundle excerpts;
- `asset-manifest.json` — public resources and transfer sizes;
- `rebuild-brief.md` — instructions for an original implementation.

An original React petal-field starter is included under `assets/rebuild/react/` for clean-room rebuilds of ambient falling-particle effects.

## What it can and cannot know

It can inspect what an ordinary browser receives: rendered DOM, public CSS and JavaScript, fonts, media, animation timing, WebGL/canvas presence, network assets, and browser-visible framework signals. With a repository supplied by the owner, it can also verify imports and implementation files.

It cannot reliably recover private source, backend language, server-only logic, original design files, or unshipped code. Compiled JavaScript is not equivalent to the original `.vue`, `.jsx`, or TypeScript files. Reports label findings as verified, strongly inferred, possible, or unknown.

## Responsible use

The default output is a clean-room recreation: original code and new content that reproduce techniques and motion grammar. Direct reuse is reserved for user-owned material or code/assets with a compatible license. See `references/legal-and-safety.md`.

## Example: what it found on Kigo Studio

The external validation run identified Nuxt, Vue, GSAP/ScrollTrigger, Netlify delivery, 18 browser-visible keyframe families, more than 80 active animations at the sampled desktop moment, and zero active animations under reduced motion. It also caught and corrected two early false positives in the detector. Read the [case study](docs/kigo-case-study.md).

## Development

Run the dependency-free signal tests:

```bash
npm test
```

## License

MIT

