import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { settleStep, settleToRest, MAX_SETTLE_STEPS } from "../src/rules/settle.ts";
import { loadLevel, LEVELS } from "../src/rules/levels.ts";

// Sensors, not contracts: these hold whatever the brief is, so they travel to
// next week's repo. Each one is here because it protects something a passing
// contract test would not notice.

const RULES = resolve("src/rules");
const ruleSources = readdirSync(RULES).map((name) => ({
  name,
  source: readFileSync(join(RULES, name), "utf8"),
}));

describe("sensor: the rules stay a pure module", () => {
  it("has rule files to check", () => {
    expect(ruleSources.length).toBeGreaterThan(0);
  });

  // The rules are the only thing the tests can hold onto. The moment they can
  // reach the page, a test stops being able to play the game without one.
  it.each(ruleSources)("$name touches no browser", ({ source }) => {
    expect(source).not.toMatch(/\b(document|window|localStorage)\b/);
  });

  it.each(ruleSources)("$name imports nothing from the UI", ({ source }) => {
    expect(source).not.toMatch(/from\s+"\.\.\/ui\//);
  });

  // A single random or clock-dependent call would make the same board play out
  // differently twice, and every test below is a claim about one exact board.
  it.each(ruleSources)("$name is deterministic", ({ source }) => {
    expect(source).not.toMatch(/Math\.random|Date\.now|new Date\b|performance\./);
  });
});

describe("sensor: every board comes to rest", () => {
  // MAX_SETTLE_STEPS is a backstop against a hang, not a budget to spend. If a
  // level ever needs most of it, the water is oscillating and the frames a
  // player watches are junk.
  it.each(LEVELS.map((_, index) => index))(
    "level %i settles, and well short of the cap",
    (index) => {
      const frames = settleToRest(loadLevel(index));
      expect(settleStep(frames.at(-1) ?? loadLevel(index))).toBeNull();
      expect(frames.length).toBeLessThan(MAX_SETTLE_STEPS / 4);
    },
  );
});
