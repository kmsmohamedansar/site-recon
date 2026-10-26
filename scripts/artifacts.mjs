import fs from "node:fs/promises";
import path from "node:path";

function uniqueBy(items, keyFor) {
  return [...new Map(items.map((item) => [keyFor(item), item])).values()];
}

export function buildObservedKeyframesCss(report) {
  const keyframes = uniqueBy(
    report.views.flatMap((view) => view.runtime.keyframes),
    (item) => `${item.name}:${JSON.stringify(item.frames)}`,
  );
  const blocks = keyframes.map((item) => {
    const frames = item.frames.map((frame) => `  ${frame.keyText} { ${frame.style} }`).join("\n");
    return `@keyframes ${item.name} {\n${frames}\n}`;
  });
  return [
    "/* Browser-observed production evidence. Preserve for analysis; do not",
    "   republish third-party code without permission or a compatible license. */",
    ...blocks,
    "",
  ].join("\n\n");
}

function summarizeAnimation(animation) {
  return {
    target: animation.target,
    timing: animation.timing,
    keyframes: animation.keyframes.map((frame) => Object.fromEntries(
      Object.entries(frame).filter(([key]) => !["computedOffset", "composite"].includes(key)),
    )),
  };
}

export function buildTechniqueEvidence(report) {
  return {
    sourceUrl: report.requestedUrl,
    inspectedAt: report.inspectedAt,
    views: report.views.map((view) => ({
      label: view.label,
      viewport: view.viewport,
      reducedMotion: view.reducedMotion,
      stack: view.stack,
      cssAnimationRules: uniqueBy(view.runtime.cssAnimations, (item) => JSON.stringify(item)),
      runtimeAnimations: view.runtime.animations.map(summarizeAnimation),
      canvases: view.runtime.canvases,
      fonts: view.runtime.fonts,
      sourceMaps: view.sourceMaps || [],
      bundleEvidence: view.bundleEvidence || [],
    })),
  };
}

export function buildAssetManifest(report) {
  const entries = report.views.flatMap((view) => view.performanceEntries.map((entry) => ({
    view: view.label,
    ...entry,
  })));
  return uniqueBy(entries, (entry) => entry.name).sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0));
}

export function buildRebuildBrief(report) {
  const normal = report.views.find((view) => view.label === "desktop") || report.views[0];
  const mobile = report.views.find((view) => view.label === "mobile");
  const reduced = report.views.find((view) => view.label === "reduced-motion");
  const stack = normal.stack.map((item) => `${item.name} (${item.confidence})`).join(", ") || "No library confidently detected";
  const names = [...new Set(normal.runtime.keyframes.map((item) => item.name))];
  const targets = [...new Set(normal.runtime.animations.map((item) => item.target).filter(Boolean))];

  return `# Clean-room rebuild brief\n\n` +
    `Source studied: ${report.requestedUrl}\n\n` +
    `## Verified browser evidence\n\n` +
    `- Stack signals: ${stack}\n` +
    `- CSS keyframes: ${names.length}${names.length ? ` (${names.join(", ")})` : ""}\n` +
    `- Active animations at sample time: desktop ${normal.runtime.animations.length}` +
    `${mobile ? `, mobile ${mobile.runtime.animations.length}` : ""}` +
    `${reduced ? `, reduced motion ${reduced.runtime.animations.length}` : ""}\n` +
    `- Animated targets: ${targets.length ? targets.join(", ") : "none observed"}\n\n` +
    `## Rebuild rules\n\n` +
    `1. Reproduce the interaction mechanism and timing relationships with original source code.\n` +
    `2. Replace the source site's text, layout composition, illustrations, photography, logos, and custom font assets.\n` +
    `3. Use observed numeric values as evidence, then tune them for the destination design rather than copying the complete composition.\n` +
    `4. Implement keyboard-equivalent states and a reduced-motion variant before considering the effect complete.\n` +
    `5. Treat bundle excerpts as forensic clues, not source files to paste into the destination project.\n\n` +
    `## Suggested implementation order\n\n` +
    `1. Build a static semantic layout using the destination site's own design tokens.\n` +
    `2. Recreate entry and viewport reveals with transforms and opacity.\n` +
    `3. Add continuous ambient effects with bounded element counts and negative delays.\n` +
    `4. Add scroll-linked behavior only where the evidence shows it materially affects the experience.\n` +
    `5. Test desktop, mobile, keyboard focus, and reduced motion.\n`;
}

export async function writeArtifacts(report, directory) {
  const output = path.resolve(directory);
  await fs.mkdir(output, { recursive: true });
  const files = {
    "observed-keyframes.css": buildObservedKeyframesCss(report),
    "technique-evidence.json": `${JSON.stringify(buildTechniqueEvidence(report), null, 2)}\n`,
    "asset-manifest.json": `${JSON.stringify(buildAssetManifest(report), null, 2)}\n`,
    "rebuild-brief.md": buildRebuildBrief(report),
  };
  for (const [name, contents] of Object.entries(files)) {
    await fs.writeFile(path.join(output, name), contents, "utf8");
  }
  return { directory: output, files: Object.keys(files) };
}
