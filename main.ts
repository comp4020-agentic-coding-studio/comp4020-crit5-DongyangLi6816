// Wires a level to the screen and to the player, and moves between levels.

import type { Game } from "./src/rules/game.ts";
import { outcomeOf } from "./src/rules/game.ts";
import { dig } from "./src/rules/dig.ts";
import { LEVELS, loadLevel } from "./src/rules/levels.ts";
import { settleToRest } from "./src/rules/settle.ts";
import { wireInput } from "./src/ui/input.ts";
import { mountBoard, paint, showCursor, type Board } from "./src/ui/render.ts";

// The pace the cause and the effect read at. Taste, not physics.
const FRAME_MS = 80;
// Long enough to watch the plant fill before the board is taken away.
const AFTER_WIN_MS = 1200;
const AFTER_LOSS_MS = 900;
const IDLE_HINT_MS = 3000;

function boardHost(): HTMLElement {
  const found = document.querySelector<HTMLElement>("#board");
  if (!found) throw new Error("no #board to play in");
  return found;
}

const host = boardHost();

let game: Game = loadLevel(0);
let board: Board = mountBoard(host, game.grid);
let busy = true;
let finished = false;
let idleTimer = 0;

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms));

function armHint(): void {
  clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => {
    board.root.dataset.hint = "on";
  }, IDLE_HINT_MS);
}

function disarmHint(): void {
  clearTimeout(idleTimer);
  delete board.root.dataset.hint;
}

async function playFrames(frames: readonly Game[]): Promise<void> {
  busy = true;
  disarmHint();
  for (const frame of frames) {
    game = frame;
    paint(board, game);
    await sleep(FRAME_MS);
  }
}

async function startLevel(index: number): Promise<void> {
  finished = false;
  game = loadLevel(index);
  board = mountBoard(host, game.grid);
  paint(board, game);
  showCursor(board, null);
  // The water finds its own level before anyone touches anything: the first
  // thing you see the board do is the thing you are about to cause.
  await playFrames(settleToRest(game));
  game = { ...game, ended: outcomeOf(game) };
  paint(board, game);
  busy = false;
  armHint();
}

async function handleDig(x: number, y: number): Promise<void> {
  if (finished) {
    await startLevel(0);
    return;
  }
  if (busy) return;
  const result = dig(game, x, y);
  if (result.frames.length === 0) return;

  await playFrames(result.frames);
  game = result.game;
  paint(board, game);

  if (game.ended === "won") {
    await sleep(AFTER_WIN_MS);
    const next = game.level + 1;
    if (next < LEVELS.length) {
      await startLevel(next);
    } else {
      finished = true;
      board.root.dataset.state = "finished";
    }
    return;
  }

  if (game.ended === "lost") {
    await sleep(AFTER_LOSS_MS);
    await startLevel(game.level);
    return;
  }

  busy = false;
  armHint();
}

wireInput({
  host,
  getGame: () => game,
  onDig: (x, y) => void handleDig(x, y),
  onCursor: (index) => showCursor(board, index),
});

void startLevel(0);
