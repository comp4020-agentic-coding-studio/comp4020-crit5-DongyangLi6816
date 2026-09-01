// Draws a board. Holds no rules: everything here is a function of the Game it
// is handed, so the simulation and the picture can never disagree.

import type { Game } from "../rules/game.ts";
import type { Grid } from "../rules/grid.ts";

export type Board = {
  readonly root: HTMLElement;
  readonly cells: readonly HTMLElement[];
  readonly grid: Grid;
};

export function mountBoard(host: HTMLElement, grid: Grid): Board {
  host.replaceChildren();
  host.style.setProperty("--w", String(grid.w));
  host.style.setProperty("--h", String(grid.h));
  const cells = grid.cells.map((_, index) => {
    const el = document.createElement("div");
    el.className = "cell";
    el.dataset.index = String(index);
    host.append(el);
    return el;
  });
  return { root: host, cells, grid };
}

export function paint(board: Board, game: Game): void {
  game.grid.cells.forEach((cell, index) => {
    const el = board.cells[index];
    el.dataset.cell = cell;
    // Only dirt answers the pointer, and only while the level is still live.
    // That is the whole of "what can I touch here", said without words.
    el.dataset.diggable = String(cell === "dirt" && game.ended === null);
  });
  board.root.style.setProperty(
    "--fill",
    String(Math.min(1, game.drunk / game.need)),
  );
  board.root.dataset.state = game.ended ?? "playing";
}

export function showCursor(board: Board, index: number | null): void {
  board.cells.forEach((el, i) => el.toggleAttribute("data-cursor", i === index));
}
