// Each level exists to teach one thing, wordlessly, and nothing else.

import type { Game } from "./game.ts";
import { parseGrid } from "./grid.ts";

// 1. There is one thing to dig, and digging lets the water down to the plant.
// 2. A drain is a way out of the board, and there is only just enough water.
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
