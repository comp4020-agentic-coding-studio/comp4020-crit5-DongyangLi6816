// Each level exists to teach one thing, wordlessly, and nothing else.

import type { Game } from "./game.ts";
import { parseGrid } from "./grid.ts";

// The first three teach one thing each and have to stay learnable at a glance;
// `spec/sensors.test.ts` holds them to that, and holds the last two to being
// genuinely hard.
//
// 1. There is one thing to dig, and digging lets the water down to the plant.
// 2. A drain is a way out of the board, and there is only just enough water.
// 3. Sand falls too, and a drain it falls into stops being one.
// 4. Three shelves down: each breach decides which way the water runs next.
// 5. The same, with sand to aim and two drains to keep out of.
export const LEVELS = [
  {
    need: 1,
    rows: [
      "#~#",
      "#d#",
      "#.#",
      "#P#",
    ],
  },
  {
    need: 2,
    rows: [
      "###~###",
      "###~###",
      "###.###",
      "#.d.d.#",
      "#.###.#",
      "#P###.#",
      "#####v#",
    ],
  },
  {
    need: 2,
    rows: [
      "#~#s##",
      "#~#d##",
      "#d#.##",
      "#....#",
      "##v#.#",
      "####.#",
      "####P#",
    ],
  },
  {
    need: 2,
    rows: [
      "####~~#",
      "####d##",
      "#.....#",
      "#vd#d##",
      "#...###",
      "#dd####",
      "#...###",
      "#d#####",
      "#P#####",
    ],
  },
  {
    need: 2,
    rows: [
      "###~~###",
      "###d####",
      "##....##",
      "##dd#v##",
      "#.s..###",
      "#d#d####",
      "#.s....#",
      "####d#v#",
      "####P###",
    ],
  },
] as const;

export function loadLevel(index: number): Game {
  const level = LEVELS[index];
  if (!level) throw new Error(`no level ${index}`);
  return {
    grid: parseGrid(level.rows),
    drunk: 0,
    need: level.need,
    level: index,
    ended: null,
  };
}
