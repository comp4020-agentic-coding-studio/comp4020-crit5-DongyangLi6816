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
// Bumped every time a board is put up, so a dig meant for the last one is
// never applied to the next.
let boardId = 0;
let finished = false;
let idleTimer = 0;
// How many digs are waiting their turn. While any are, whoever is watching is
// ahead of the animation, so stop showing it to them.
let waiting = 0;
// Everything that changes the board happens in order, however fast the clicks
// arrive.
let queue: Promise<void> = Promise.resolve();

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
  disarmHint();
  for (const frame of frames) {
    game = frame;
    if (waiting > 0) continue;
    paint(board, game);
    await sleep(FRAME_MS);
  }
  paint(board, game);
}

async function startLevel(index: number): Promise<void> {
  finished = false;
  boardId += 1;
  game = loadLevel(index);
  board = mountBoard(host, game.grid);
  paint(board, game);
  showCursor(board, null);
  // The water finds its own level before anyone touches anything: the first
  // thing you see the board do is the thing you are about to cause.
  await playFrames(settleToRest(game));
  game = { ...game, ended: outcomeOf(game) };
  paint(board, game);
  armHint();
}

async function play(x: number, y: number): Promise<void> {
  const result = dig(game, x, y);
  if (result.frames.length === 0) {
    armHint();
    return;
  }

  await playFrames(result.frames);
  game = result.game;
  paint(board, game);

  if (game.ended === "won") {
    await sleep(waiting > 0 ? 0 : AFTER_WIN_MS);
    const next = game.level + 1;
    if (next < LEVELS.length) {
      await startLevel(next);
    } else {
      finished = true;
      boardId += 1;
      board.root.dataset.state = "finished";
    }
    return;
  }

  if (game.ended === "lost") {
    await sleep(waiting > 0 ? 0 : AFTER_LOSS_MS);
    await startLevel(game.level);
    return;
  }

  armHint();
}

// A dig is never dropped. If the water is still running, the click means "I
// have seen enough of that" --- the board jumps to where it was going, and
// then the dig lands. Dirt does not move while things settle, so the cell they
// aimed at is still the cell they get.
function request(x: number, y: number): void {
  const meantFor = boardId;
  waiting += 1;
  queue = queue
    .then(async () => {
      waiting -= 1;
      if (finished) {
        await startLevel(0);
        return;
      }
      if (boardId !== meantFor) return;
      await play(x, y);
    })
    .catch((error: unknown) => {
      console.error(error);
    });
}

wireInput({
  host,
  getGame: () => game,
  onDig: request,
  onCursor: (index) => showCursor(board, index),
});

queue = queue.then(() => startLevel(0));
