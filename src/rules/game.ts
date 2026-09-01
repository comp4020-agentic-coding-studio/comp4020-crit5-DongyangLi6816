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

// Won when the plant has drunk its fill. Lost when the water ran away, or when
// there is nothing left to dig and the plant is still thirsty. Without that
// second clause a board can stop being winnable without ever ending, and the
// player is left holding a screen that will never do anything again.
export function outcomeOf(game: Game): Outcome {
  if (game.drunk >= game.need) return "won";
  if (countWater(game.grid) === 0) return "lost";
  if (!game.grid.cells.includes("dirt")) return "lost";
  return null;
}

// The board once it has stopped moving, with the outcome read off it.
export function settled(game: Game): Game {
  const rested = settleToRest(game).at(-1) ?? game;
  return { ...rested, ended: outcomeOf(rested) };
}
