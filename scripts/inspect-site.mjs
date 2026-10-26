#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { detectStackFromSignals } from "./detect-stack.mjs";
import { writeArtifacts } from "./artifacts.mjs";

function usage() {
  console.log("Usage: node scripts/inspect-site.mjs <url> [--out report.json] [--artifacts-dir dir] [--timeout 30000]");
}

function parseArgs(argv) {
  const args = [...argv];
  const url = args.shift();
  if (url === "--help" || url === "-h") return { help: true };
  let out = "site-recon.json";
  let artifactsDir = null;
  let timeout = 30000;
  while (args.length) {
    const flag = args.shift();
    if (flag === "--out") out = args.shift();
    else if (flag === "--artifacts-dir") artifactsDir = args.shift();
    else if (flag === "--timeout") timeout = Number(args.shift());
    else throw new Error(`Unknown argument: ${flag}`);
  }
  if (!url) return null;
  const parsed = new URL(url);
  if (!/^https?:$/.test(parsed.protocol)) throw new Error("Only http:// and https:// URLs are supported");
  if (!Number.isFinite(timeout) || timeout < 1000) throw new Error("--timeout must be at least 1000ms");
  return { url: parsed.href, out, artifactsDir, timeout };
}

function buildBundleEvidence(stack, scriptBodies) {
  const excerpts = [];
  for (const finding of stack) {
    for (const evidence of finding.evidence) {
      if (!evidence.source.startsWith("http") || !evidence.match) continue;
      const body = scriptBodies.find((item) => item.source === evidence.source)?.value || "";
      const index = body.indexOf(evidence.match);
      if (index < 0) continue;
      const start = Math.max(0, index - 180);
      const end = Math.min(body.length, index + evidence.match.length + 260);
      excerpts.push({
        technology: finding.name,
        source: evidence.source,
        matchedSignal: evidence.match,
        excerpt: body.slice(start, end).replace(/\s+/g, " "),
      });
    }
  }
  return [...new Map(excerpts.map((item) => [`${item.technology}:${item.source}:${item.matchedSignal}`, item])).values()].slice(0, 24);
}

function findSourceMaps(scriptBodies) {
  return scriptBodies.flatMap((item) => {
    const matches = [...item.value.matchAll(/[#@]\s*sourceMappingURL=([^\s*]+)/g)];
    return matches.map((match) => ({ script: item.source, reference: match[1] }));
  });
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    throw new Error("Playwright is not installed. Run `npm install` in the site-recon directory first.");
  }
}

async function inspectViewport(browser, options, viewport, label, reducedMotion = "no-preference") {
  const context = await browser.newContext({
    viewport,
    reducedMotion,
    colorScheme: "light",
  });
  const page = await context.newPage();
  const responses = [];
  const scriptBodyPromises = [];
  const consoleErrors = [];

  page.on("response", (response) => {
    const request = response.request();
    const type = request.resourceType();
    if (["document", "script", "stylesheet", "font", "image", "media"].includes(type)) {
      const headers = response.headers();
      responses.push({
        url: response.url(),
        status: response.status(),
        type,
        headers: type === "document" ? {
          server: headers.server || null,
          poweredBy: headers["x-powered-by"] || null,
          cache: headers["x-cache"] || headers["cf-cache-status"] || null,
        } : undefined,
      });
      if (type === "script") {
        scriptBodyPromises.push(response.text()
          .then((text) => ({ source: response.url(), value: text.slice(0, 1_000_000) }))
          .catch(() => ({ source: response.url(), value: "" })));
      }
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto(options.url, { waitUntil: "networkidle", timeout: options.timeout });

  const runtime = await page.evaluate(() => {
    const selectorFor = (element) => {
      if (!(element instanceof Element)) return null;
      if (element.id) return `#${CSS.escape(element.id)}`;
      const classes = [...element.classList].slice(0, 3).map((item) => `.${CSS.escape(item)}`).join("");
      return `${element.tagName.toLowerCase()}${classes}`;
    };

    const stylesheets = [...document.styleSheets].map((sheet) => ({ href: sheet.href, disabled: sheet.disabled }));
    const scripts = [...document.scripts].map((script) => ({ src: script.src || null, type: script.type || "classic" }));
    const fonts = document.fonts
      ? [...new Map([...document.fonts].map((font) => {
          const item = { family: font.family, style: font.style, weight: font.weight, status: font.status };
          return [`${item.family}|${item.style}|${item.weight}|${item.status}`, item];
        })).values()]
      : [];
    const cssAnimations = [];
    const keyframes = [];

    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = [...sheet.cssRules]; } catch { continue; }
      const visit = (items) => {
        for (const rule of items) {
          if (rule.type === CSSRule.KEYFRAMES_RULE) {
            keyframes.push({
              name: rule.name,
              frames: [...rule.cssRules].map((frame) => ({ keyText: frame.keyText, style: frame.style.cssText })),
            });
          }
          if (rule.type === CSSRule.STYLE_RULE) {
            const style = rule.style;
            if (style.animationName && style.animationName !== "none") {
              cssAnimations.push({
                selector: rule.selectorText,
                name: style.animationName,
                duration: style.animationDuration,
                delay: style.animationDelay,
                easing: style.animationTimingFunction,
                iterationCount: style.animationIterationCount,
              });
            }
          }
          if (rule.cssRules) visit([...rule.cssRules]);
        }
      };
      visit(rules);
    }

    const animations = document.getAnimations().slice(0, 300).map((animation) => {
      const effect = animation.effect;
      const timing = effect?.getComputedTiming?.() || {};
      const keyframeData = effect?.getKeyframes?.() || [];
      return {
        target: selectorFor(effect?.target),
        playState: animation.playState,
        currentTime: animation.currentTime,
        timing: {
          delay: timing.delay,
          duration: timing.duration,
          endDelay: timing.endDelay,
          easing: timing.easing,
          iterations: timing.iterations,
          fill: timing.fill,
          direction: timing.direction,
        },
        keyframes: keyframeData,
      };
    });

    // Calling getContext() can create a new rendering context and alter the page,
    // so context type is inferred from delivered scripts rather than probed here.
    const canvases = [...document.querySelectorAll("canvas")].map((canvas) => ({
      selector: selectorFor(canvas), width: canvas.width, height: canvas.height,
    }));

    const meta = Object.fromEntries([...document.querySelectorAll("meta[name], meta[property]")]
      .map((node) => [node.getAttribute("name") || node.getAttribute("property"), node.content]));
    const links = [...document.querySelectorAll("link[href]")].map((node) => ({ rel: node.rel, href: node.href, as: node.as || null }));
    const interactive = [...document.querySelectorAll("a, button, input, select, textarea, [tabindex]")]
      .slice(0, 300)
      .map((node) => ({ selector: selectorFor(node), role: node.getAttribute("role"), label: node.getAttribute("aria-label"), text: node.textContent?.trim().slice(0, 100) || null }));

    return {
      title: document.title,
      url: location.href,
      lang: document.documentElement.lang || null,
      meta,
      scripts,
      stylesheets,
      links,
      fonts,
      keyframes,
      cssAnimations,
      animations,
      canvases,
      interactive,
      dom: {
        elementCount: document.querySelectorAll("*").length,
        headings: [...document.querySelectorAll("h1,h2,h3")].map((node) => ({ level: node.tagName, text: node.textContent?.trim().slice(0, 160) })),
        hasReactRoot: Boolean(document.querySelector("#root, #__next, [data-reactroot]")),
        astroIslands: document.querySelectorAll("astro-island").length,
      },
      media: {
        reducedMotionQuery: matchMedia("(prefers-reduced-motion: reduce)").matches,
        coarsePointer: matchMedia("(pointer: coarse)").matches,
      },
    };
  });

  const performanceEntries = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => ({
    name: entry.name,
    initiatorType: entry.initiatorType,
    transferSize: entry.transferSize,
    decodedBodySize: entry.decodedBodySize,
    duration: Math.round(entry.duration * 10) / 10,
  })));
  const scriptBodies = await Promise.all(scriptBodyPromises);

  const signalValues = [
    { source: "document:scripts", value: JSON.stringify(runtime.scripts) },
    { source: "document:stylesheets", value: JSON.stringify(runtime.stylesheets) },
    { source: "document:links", value: JSON.stringify(runtime.links) },
    { source: "document:dom", value: JSON.stringify(runtime.dom) },
    { source: "performance:resources", value: performanceEntries.map((entry) => entry.name).join("\n") },
    ...scriptBodies,
  ];
  const stack = detectStackFromSignals(signalValues);
  const bundleEvidence = buildBundleEvidence(stack, scriptBodies);
  const sourceMaps = findSourceMaps(scriptBodies);
  await context.close();

  return { label, viewport, reducedMotion, runtime, stack, responses, performanceEntries, consoleErrors, bundleEvidence, sourceMaps };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options) {
    usage();
    process.exitCode = 1;
    return;
  }
  if (options.help) {
    usage();
    return;
  }
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  try {
    const desktop = await inspectViewport(browser, options, { width: 1440, height: 1000 }, "desktop");
    const mobile = await inspectViewport(browser, options, { width: 390, height: 844 }, "mobile");
    const reducedMotion = await inspectViewport(browser, options, { width: 1440, height: 1000 }, "reduced-motion", "reduce");
    const report = {
      schemaVersion: 1,
      inspectedAt: new Date().toISOString(),
      requestedUrl: options.url,
      caveats: [
        "This report contains public browser-surface observations, not private source or backend inspection.",
        "Library detections are evidence-based signals and should be verified against source when available.",
      ],
      views: [desktop, mobile, reducedMotion],
    };
    const outputPath = path.resolve(options.out);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`Wrote ${outputPath}`);
    if (options.artifactsDir) {
      const artifacts = await writeArtifacts(report, options.artifactsDir);
      console.log(`Wrote ${artifacts.files.length} extraction artifacts to ${artifacts.directory}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

