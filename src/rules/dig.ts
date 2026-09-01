// The one thing a player can do.

import type { Game } from "./game.ts";
import { outcomeOf } from "./game.ts";
import { at, setCell } from "./grid.ts";
import { settleToRest } from "./settle.ts";

export type DigResult = {
  readonly game: Game;
  // The board with the hole in it, then one frame per unit of water that moved.
  readonly frames: readonly Game[];
};

// Total on purpose: digging rock, water, air, a finished board or somewhere off
// the board leaves the game exactly as it was and reports no frames. That lets
// anything enumerate every possible click without special cases.
export function dig(game: Game, x: number, y: number): DigResult {
  if (game.ended !== null || at(game.grid, x, y) !== "dirt") {
    return { game, frames: [] };
  }
  const opened: Game = { ...game, grid: setCell(game.grid, x, y, "empty") };
  const frames: Game[] = [opened, ...settleToRest(opened)];
  const rested = frames[frames.length - 1];
  const final: Game = { ...rested, ended: outcomeOf(rested) };
  frames[frames.length - 1] = final;
  return { game: final, frames };
}
