// How water behaves once a hole opens up. One unit moves per step, so the
// caller gets a frame per movement and the animation is a by-product of the
// simulation rather than a second copy of it.

import type { Grid } from "./grid.ts";
import { at } from "./grid.ts";

// Anything the simulation can advance: a board, plus what the plant has drunk.
export type Sim = { readonly grid: Grid; readonly drunk: number };

// A unit lands somewhere, is drunk by the plant, fills a drain in, or leaves.
type Move =
  | { kind: "move"; x: number; y: number }
  | { kind: "drink" }
  | { kind: "plug"; x: number; y: number }
  | { kind: "drain" };

// Where a unit of water at (x, y) would end up moving by (dx, dy), or null if
// something is in the way. Every edge of the board is a wall: water is only
// ever lost down a drain, which is a cell you can see before you let the water
// anywhere near it.
function target(
  grid: Grid,
  x: number,
  y: number,
  dx: number,
  dy: number,
): Move | null {
  const nx = x + dx;
  const ny = y + dy;
  if (nx < 0 || nx >= grid.w) return null;
  if (ny < 0 || ny >= grid.h) return null;
  const cell = at(grid, nx, ny);
  if (cell === "empty") return { kind: "move", x: nx, y: ny };
  if (cell === "plant") return { kind: "drink" };
  if (cell === "drain") return { kind: "drain" };
  return null;
}

// How far away, in `dir`, is the nearest place this row's water could fall
// from? null when there is none. Water only flows sideways towards a way down,
// which is what stops it sloshing between two walls forever.
function distanceToDrop(
  grid: Grid,
  x: number,
  y: number,
  dir: -1 | 1,
): number | null {
  for (let d = 1; d < grid.w; d++) {
    const nx = x + dir * d;
    const cell = at(grid, nx, y);
    if (cell === "plant" || cell === "drain") return d;
    if (cell !== "empty") return null;
    if (target(grid, nx, y, 0, 1) !== null) return d;
  }
  return null;
}

// Where sand goes: straight down, or off the side of a heap. Sand never flows
// sideways, which is the whole of the difference between it and water --- and
// the reason a heap of it stops water going that way.
function sandTarget(grid: Grid, x: number, y: number, dx: number): Move | null {
  const nx = x + dx;
  const ny = y + 1;
  if (nx < 0 || nx >= grid.w || ny >= grid.h) return null;
  const cell = at(grid, nx, ny);
  if (cell === "empty") return { kind: "move", x: nx, y: ny };
  // Sand that reaches a drain fills it in. That is the only way a drain ever
  // stops being one, and like every dig here, it cannot be taken back.
  if (cell === "drain") return { kind: "plug", x: nx, y: ny };
  return null;
}

// Nothing slips through a diagonal crack: a unit only moves off a corner when
// the cell beside it is open too.
function beside(grid: Grid, x: number, y: number, dx: number): boolean {
  return at(grid, x + dx, y) === "empty";
}

function sandMove(grid: Grid, x: number, y: number): Move | null {
  const down = sandTarget(grid, x, y, 0);
  if (down) return down;
  for (const dx of [-1, 1] as const) {
    if (!beside(grid, x, y, dx)) continue;
    const slide = sandTarget(grid, x, y, dx);
    if (slide) return slide;
  }
  return null;
}

function waterMove(grid: Grid, x: number, y: number): Move | null {
  const down = target(grid, x, y, 0, 1);
  if (down) return down;
  const downLeft = beside(grid, x, y, -1) ? target(grid, x, y, -1, 1) : null;
  if (downLeft) return downLeft;
  const downRight = beside(grid, x, y, 1) ? target(grid, x, y, 1, 1) : null;
  if (downRight) return downRight;

  const left = distanceToDrop(grid, x, y, -1);
  const right = distanceToDrop(grid, x, y, 1);
  if (left === null && right === null) return null;
  // Ties go left, so the same board always plays out the same way.
  const dir = right === null || (left !== null && left <= right) ? -1 : 1;
  return target(grid, x, y, dir, 0);
}

function apply<T extends Sim>(sim: T, x: number, y: number, move: Move): T {
  const cells = sim.grid.cells.slice();
  const moving = cells[y * sim.grid.w + x];
  cells[y * sim.grid.w + x] = "empty";
  if (move.kind === "move") cells[move.y * sim.grid.w + move.x] = moving;
  if (move.kind === "plug") cells[move.y * sim.grid.w + move.x] = "sand";
  return {
    ...sim,
    grid: { ...sim.grid, cells },
    drunk: move.kind === "drink" ? sim.drunk + 1 : sim.drunk,
  };
}

// One unit of water moves, or nothing does. Scanning bottom-up and left to
// right keeps the whole simulation deterministic, which is what lets a test
// play a level out move by move and get the same board every time.
export function settleStep<T extends Sim>(sim: T): T | null {
  const { grid } = sim;
  for (let y = grid.h - 1; y >= 0; y--) {
    for (let x = 0; x < grid.w; x++) {
      const cell = at(grid, x, y);
      if (cell !== "water" && cell !== "sand") continue;
      const move =
        cell === "water" ? waterMove(grid, x, y) : sandMove(grid, x, y);
      if (move) return apply(sim, x, y, move);
    }
  }
  return null;
}

// A backstop, not a rule: if a board ever failed to come to rest, this is what
// would stop the page hanging. `spec/sensors.test.ts` asserts no shipped level
// gets anywhere near it.
export const MAX_SETTLE_STEPS = 400;

// Every frame from the board as given to the board at rest, excluding the one
// passed in.
export function settleToRest<T extends Sim>(start: T): T[] {
  const frames: T[] = [];
  let current = start;
  for (let step = 0; step < MAX_SETTLE_STEPS; step++) {
    const next = settleStep(current);
    if (next === null) return frames;
    current = next;
    frames.push(current);
  }
  return frames;
}
