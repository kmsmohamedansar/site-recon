import test from "node:test";
import assert from "node:assert/strict";
import { detectStackFromSignals } from "../scripts/detect-stack.mjs";

test("detects a Vite, React, Three.js, and Framer Motion surface", () => {
  const findings = detectStackFromSignals([
    "/assets/index-C-FZH-EL.js",
    "react-dom framer-motion",
    "three.module-Braq6_Z8.js OrbitControls",
  ]);
  const names = findings.map((finding) => finding.name);
  assert.ok(names.includes("React"));
  assert.ok(names.includes("Vite"));
  assert.ok(names.includes("Three.js"));
  assert.ok(names.includes("Motion / Framer Motion"));
});

test("does not claim unrelated frameworks", () => {
  const findings = detectStackFromSignals(["/assets/site.css", "/assets/site.js"]);
  assert.deepEqual(findings, []);
});

test("does not mistake Vue reactivity or prose for React and Three.js", () => {
  const findings = detectStackFromSignals([
    "__v_isReactive __v_isReadonly",
    "you may not need all three. Explore our services",
  ]);
  const names = findings.map((finding) => finding.name);
  assert.ok(!names.includes("React"));
  assert.ok(!names.includes("Three.js"));
});

