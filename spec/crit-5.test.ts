import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { dig } from "../src/rules/dig.ts";
import { countWater, settled } from "../src/rules/game.ts";
import { LEVELS, loadLevel } from "../src/rules/levels.ts";

// C5 --- "A game". These answer this week's published spec, so they retire
// with it: https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/05-game/
//
// They run against the BUILT site, like the invariants, and assert the
// contract --- what the page must do --- rather than how the game is built.
//
// Left to the crit, because no test settles them: whether the opening screen
// makes the first move obvious, whether a stranger reaches an ending inside
// five minutes, whether the change that came from playing was the right one,
// and whether you can account for how you directed the work.
const DIST = resolve("dist");

// The one dirt wall on level 2 that opens onto the bottom edge instead of the
// plant, and a winning dig for each shipped level.
const OFF_THE_BOARD = [4, 3] as const;
const WINNING_DIGS: readonly (readonly (readonly [number, number])[])[] = [
  [[1, 1]],
  [[2, 3]],
];
const html = readFileSync(resolve(DIST, "index.html"), "utf8");
const doc = new JSDOM(html).window.document;
const visibleText = doc.body.textContent?.replace(/\s+/g, " ").trim() ?? "";

describe("crit 5: the page ships a game", () => {
  it("is not still the template placeholder", () => {
    expect(doc.title.trim()).not.toBe("COMP4020 prototype");
    expect(visibleText).not.toMatch(/Replace this with your prototype/i);
  });

  it("offers something to act on without being told to", () => {
    // Presence only --- whether the first move is *obvious* is the pod's call.
    const playable = doc.querySelector(
      "main canvas, main button, main [tabindex], main input, main a[href]:not([href='./'])",
    );
    expect(
      playable,
      "the opening screen has to invite a first move on its own",
    ).not.toBeNull();
  });
});

describe("crit 5: it teaches itself", () => {
  const TUTORIAL = /how to play|instructions|tutorial|how it works|the rules are|use the arrow keys/i;

  it("carries no instructions in the shipped page", () => {
    expect(visibleText).not.toMatch(TUTORIAL);
  });

  it("carries no instructions in the README either", () => {
    // "nothing in the README standing in for either" --- the brief is explicit
    // that the no-tutorial rule does not stop at the page boundary.
    expect(readFileSync(resolve("README.md"), "utf8")).not.toMatch(TUTORIAL);
  });
});

describe("crit 5: it can be lost", () => {
  // Pinned to the rule module, not the rendering, so it survives a rewrite of
  // the UI --- or of the whole front end.

  it("a wrong move ends the game", () => {
    // Level 2 puts a wall either side of the water: the left one opens onto the
    // plant, the right one onto the bottom edge. Breaching the right one spends
    // every drop on nothing, and there is no way back.
    const opening = settled(loadLevel(1));
    expect(opening.ended, "the level has to start playable").toBeNull();

    const after = dig(opening, ...OFF_THE_BOARD).game;

    expect(after.ended).toBe("lost");
    expect(countWater(after.grid), "the water ran off the board").toBe(0);
    expect(after.drunk, "and the plant never got any of it").toBeLessThan(
      after.need,
    );
  });

  it("play ends somewhere: a win, a loss or a finish", () => {
    // Every shipped level can be finished, and finishing the last one finishes
    // the game. A level nobody can solve would end play too, just not anywhere.
    LEVELS.forEach((_, index) => {
      let game = settled(loadLevel(index));
      for (const [x, y] of WINNING_DIGS[index]) game = dig(game, x, y).game;
      expect(game.ended, `level ${index + 1} has to be winnable`).toBe("won");
    });

    expect(LEVELS.length, "the last win is the end of the game").toBeGreaterThan(
      0,
    );
  });

  it("digging anything but dirt changes nothing", () => {
    // `dig` is total, which is what lets a solver enumerate every click.
    const opening = settled(loadLevel(1));
    for (const [x, y] of [[0, 0], [3, 0], [1, 5], [-1, 0], [99, 99]] as const) {
      const result = dig(opening, x, y);
      expect(result.frames).toHaveLength(0);
      expect(result.game).toBe(opening);
    }
  });
});
