// Every way in to the one action. Pointer and touch share the click path;
// the keyboard gets a cursor that only appears once someone reaches for it.

import type { Game } from "../rules/game.ts";

export type Wiring = {
  readonly host: HTMLElement;
  readonly getGame: () => Game;
  readonly onDig: (x: number, y: number) => void;
  readonly onCursor: (index: number | null) => void;
};

const STEPS: Readonly<Record<string, readonly [number, number]>> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

export function wireInput({ host, getGame, onDig, onCursor }: Wiring): void {
  let cursor: number | null = null;

  const firstDiggable = (game: Game): number =>
    Math.max(0, game.grid.cells.indexOf("dirt"));

  host.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const cell = target.closest<HTMLElement>("[data-index]");
    if (!cell) return;
    const index = Number(cell.dataset.index);
    const { w } = getGame().grid;
    onDig(index % w, Math.floor(index / w));
  });

  host.addEventListener("keydown", (event) => {
    const game = getGame();
    const { w, h } = game.grid;

    const step = STEPS[event.key];
    if (step) {
      event.preventDefault();
      // The first arrow key doesn't move anything — it just shows where the
      // cursor is, on something worth digging.
      if (cursor === null) {
        cursor = firstDiggable(game);
      } else {
        const x = Math.min(w - 1, Math.max(0, (cursor % w) + step[0]));
        const y = Math.min(h - 1, Math.max(0, Math.floor(cursor / w) + step[1]));
        cursor = y * w + x;
      }
      onCursor(cursor);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (cursor === null) {
        cursor = firstDiggable(game);
        onCursor(cursor);
        return;
      }
      onDig(cursor % w, Math.floor(cursor / w));
    }
  });
}
