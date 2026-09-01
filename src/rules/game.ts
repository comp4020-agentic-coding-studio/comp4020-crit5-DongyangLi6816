// What a level is, and when it is over.

import type { Grid } from "./grid.ts";
import type { Sim } from "./settle.ts";
import { settleToRest } from "./settle.ts";

export type Outcome = "won" | "lost" | null;

export type Game = Sim & {
  readonly level: number;
  // How much water the plant has to drink for this level to be won.
  readonly need: number;
  readonly ended: Outcome;
};

export function countWater(grid: Grid): number {
  return grid.cells.filter((cell) => cell === "water").length;
}

// Won when the plant has drunk its fill. Lost when there is no water left on
// the board and it hasn't — losing is exactly "you let it run away".
export function outcomeOf(game: Game): Outcome {
  if (game.drunk >= game.need) return "won";
  if (countWater(game.grid) === 0) return "lost";
  return null;
}

// The board once it has stopped moving, with the outcome read off it.
export function settled(game: Game): Game {
  const rested = settleToRest(game).at(-1) ?? game;
  return { ...rested, ended: outcomeOf(rested) };
}
