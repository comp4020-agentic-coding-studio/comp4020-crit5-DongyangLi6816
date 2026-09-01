import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { settleStep, settleToRest, MAX_SETTLE_STEPS } from "../src/rules/settle.ts";
import { loadLevel, LEVELS } from "../src/rules/levels.ts";
import { dig } from "../src/rules/dig.ts";
import type { Game } from "../src/rules/game.ts";
import { settled } from "../src/rules/game.ts";

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

// Walks a level's whole game tree once and reads everything off it. Small
// boards with a handful of diggable cells, so this stays cheap --- the cap is
// here so a board whose search blew up fails loudly instead of quietly getting
// slower.
const SEARCH_CAP = 5000;

type Reading = {
  index: number;
  won: boolean;
  lost: boolean;
  states: number;
  // The shortest number of digs that wins: how far ahead the board makes you read.
  digsToWin: number;
  // How many opening digs leave a win still reachable. While this is 1 there is
  // no decision on the board, only a cell to spot --- which is what "too easy"
  // turned out to mean.
  keeps: number;
};

function read(index: number): Reading {
  const start = settled(loadLevel(index));
  const key = (game: Game) => `${game.grid.cells.join("")}|${game.drunk}`;
  const id = new Map([[key(start), 0]]);
  const nodes: Game[] = [start];
  const edges: number[][] = [[]];
  const depth = [0];
  const queue = [0];

  while (queue.length > 0 && nodes.length <= SEARCH_CAP) {
    const from = queue.shift() as number;
    const game = nodes[from];
    if (game.ended !== null) continue;
    for (let y = 0; y < game.grid.h; y += 1) {
      for (let x = 0; x < game.grid.w; x += 1) {
        const next = dig(game, x, y).game;
        if (next === game) continue;
        const seen = id.get(key(next));
        if (seen !== undefined) {
          edges[from].push(seen);
          continue;
        }
        const to = nodes.length;
        id.set(key(next), to);
        nodes.push(next);
        edges.push([]);
        depth.push(depth[from] + 1);
        edges[from].push(to);
        queue.push(to);
      }
    }
  }

  // Which boards can still reach a win, propagated back from the wins.
  const alive = nodes.map((game) => game.ended === "won");
  for (;;) {
    let changed = false;
    for (let i = 0; i < nodes.length; i += 1) {
      if (alive[i] || !edges[i].some((j) => alive[j])) continue;
      alive[i] = true;
      changed = true;
    }
    if (!changed) break;
  }

  const wins = nodes.flatMap((game, i) => (game.ended === "won" ? [depth[i]] : []));
  return {
    index,
    won: wins.length > 0,
    lost: nodes.some((game) => game.ended === "lost"),
    states: nodes.length,
    digsToWin: wins.length > 0 ? Math.min(...wins) : Infinity,
    keeps: edges[0].filter((j) => alive[j]).length,
  };
}

// The first three levels teach one thing each; the rest are the game.
const TEACHING = 3;

describe("sensor: every level plays out the way it was designed to", () => {
  const readings = LEVELS.map((_, index) => read(index));

  it.each(readings)("level $index has a way to win", ({ won }) => {
    expect(won).toBe(true);
  });

  it.each(readings)("level $index searches without blowing up", ({ states }) => {
    expect(states).toBeLessThan(SEARCH_CAP);
  });

  // The first board is the one nobody has been told anything about, so nothing
  // it lets you do is allowed to be wrong.
  it("level 0 cannot be lost", () => {
    expect(readings[0].lost).toBe(false);
  });

  // Every board after it has to have a wrong move in it, or the game is a toy.
  it.each(readings.slice(1))("level $index can be lost", ({ lost }) => {
    expect(lost).toBe(true);
  });

  // A teaching level that grew a puzzle in it stops teaching. This is the only
  // check that fails when a level gets *harder*.
  it.each(readings.slice(0, TEACHING))(
    "level $index stays learnable at a glance",
    ({ digsToWin }) => {
      expect(digsToWin).toBeLessThanOrEqual(2);
    },
  );

  // And the rest have to stay hard. Measured, because "too easy" is not
  // something the suite noticed on its own the first time round.
  it.each(readings.slice(TEACHING))(
    "level $index makes you read ahead",
    ({ digsToWin }) => {
      expect(digsToWin).toBeGreaterThanOrEqual(4);
    },
  );

  it.each(readings.slice(TEACHING))(
    "level $index offers a real choice, not one right cell",
    ({ keeps }) => {
      expect(keeps).toBeGreaterThanOrEqual(3);
    },
  );
});
