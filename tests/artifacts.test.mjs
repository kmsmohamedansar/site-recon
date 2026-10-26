import test from "node:test";
import assert from "node:assert/strict";
import { buildObservedKeyframesCss, buildRebuildBrief } from "../scripts/artifacts.mjs";

const report = {
  requestedUrl: "https://example.com/",
  inspectedAt: "2026-10-26T00:00:00.000Z",
  views: [
    {
      label: "desktop",
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "no-preference",
      stack: [{ name: "Vue", confidence: "verified", evidence: [] }],
      runtime: {
        keyframes: [{ name: "rise", frames: [{ keyText: "from", style: "opacity: 0;" }, { keyText: "to", style: "opacity: 1;" }] }],
        cssAnimations: [], animations: [{ target: ".title", timing: {}, keyframes: [] }], canvases: [], fonts: [],
      },
      performanceEntries: [],
    },
    {
      label: "reduced-motion",
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
      stack: [],
      runtime: { keyframes: [], cssAnimations: [], animations: [], canvases: [], fonts: [] },
      performanceEntries: [],
    },
  ],
};

test("exports browser-observed keyframes as reviewable CSS", () => {
  const css = buildObservedKeyframesCss(report);
  assert.match(css, /@keyframes rise/);
  assert.match(css, /from \{ opacity: 0; \}/);
});

test("builds a clean-room brief with reduced-motion evidence", () => {
  const brief = buildRebuildBrief(report);
  assert.match(brief, /Vue \(verified\)/);
  assert.match(brief, /reduced motion 0/);
  assert.match(brief, /original source code/);
});
