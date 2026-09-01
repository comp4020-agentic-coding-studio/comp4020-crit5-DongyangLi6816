// Each level exists to teach one thing, wordlessly, and nothing else.

import type { Game } from "./game.ts";
import { parseGrid } from "./grid.ts";

// 1. There is one thing to dig, and digging lets the water down to the plant.
// 2. A drain is a way out of the board, and there is only just enough water.
// 3. The order you open things in is the whole puzzle: let the water out
//    before the way down is open and it goes to the drain instead.
// 4. Sand falls too, and a drain it falls into stops being one.
// 5. Both at once, and the sand can be aimed the wrong way.
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
      "##~~###",
      "##d####",
      "#.....#",
      "##d##v#",
      "##.####",
      "##P####",
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
      "#~#.s.#",
      "#~#d#d#",
      "#d#.#.#",
      "#.....#",
      "##v##.#",
      "#####.#",
      "#####P#",
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
