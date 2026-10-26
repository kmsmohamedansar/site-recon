const SIGNALS = [
  { name: "React", confidence: "strongly inferred", patterns: [/\breact-dom\b/i, /__react(?:Fiber|Props)\$/i, /data-reactroot/i, /react(?:-jsx-runtime|\.production\.min)/i] },
  { name: "Next.js", confidence: "verified", patterns: [/_next\//i, /__NEXT_DATA__/] },
  { name: "Nuxt", confidence: "verified", patterns: [/_nuxt\//i, /__NUXT__/] },
  { name: "Vue", confidence: "strongly inferred", patterns: [/vue(?:\.runtime)?/i, /data-v-[a-f0-9]+/i, /__vue__/i] },
  { name: "Svelte", confidence: "strongly inferred", patterns: [/svelte/i, /svelte-[a-z0-9]+/i] },
  { name: "Astro", confidence: "verified", patterns: [/astro-island/i, /_astro\//i] },
  { name: "Vite", confidence: "strongly inferred", patterns: [/\/assets\/index-[\w-]+\.(?:js|css)/i, /@vite\/client/i, /vite\/preload-helper/i] },
  { name: "Webpack", confidence: "strongly inferred", patterns: [/webpackChunk/i, /__webpack_require__/i] },
  { name: "Three.js", confidence: "verified", patterns: [/three(?:\.module)?[-.][\w-]+\.js/i, /\bTHREE\./, /\bWebGLRenderer\b/, /\bOrbitControls\b/] },
  { name: "GSAP", confidence: "verified", patterns: [/gsap(?:\.min)?\.js|ScrollTrigger|gsap\./i] },
  { name: "Motion / Framer Motion", confidence: "strongly inferred", patterns: [/framer-motion|motion-dom|motion\/react|MotionGlobalConfig|motionValue|visualElement/i] },
  { name: "Lottie", confidence: "verified", patterns: [/lottie(?:-web)?|bodymovin/i] },
  { name: "Lenis", confidence: "verified", patterns: [/@studio-freight\/lenis|lenis(?:\.min)?\.js/i] },
  { name: "Tailwind CSS", confidence: "strongly inferred", patterns: [/--tw-[\w-]+/i, /tailwindcss/i] },
  { name: "Bootstrap", confidence: "strongly inferred", patterns: [/bootstrap(?:\.min)?\.(?:css|js)/i, /--bs-[\w-]+/i] },
];

export function detectStackFromSignals(values) {
  const entries = values.filter(Boolean).map((value, index) => typeof value === "string"
    ? { source: `signal:${index + 1}`, value }
    : value);
  return SIGNALS.flatMap((signal) => {
    const evidence = signal.patterns.flatMap((pattern) => entries.flatMap((entry) => {
      pattern.lastIndex = 0;
      const match = entry.value.match(pattern);
      return match ? [{ pattern: pattern.source, source: entry.source, match: match[0] }] : [];
    }));
    return evidence.length ? [{ name: signal.name, confidence: signal.confidence, evidence }] : [];
  });
}

export { SIGNALS };

