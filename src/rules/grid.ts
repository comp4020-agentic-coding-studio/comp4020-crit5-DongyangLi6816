// The board, and nothing else. No behaviour lives here — only the shape the
// rules move things around on.

export type Cell =
  | "empty"
  | "dirt"
  | "rock"
  | "water"
  | "sand"
  | "plant"
  | "drain";

export type Grid = {
  readonly w: number;
  readonly h: number;
  readonly cells: readonly Cell[];
};

const GLYPHS: Readonly<Record<string, Cell>> = {
  ".": "empty",
  d: "dirt",
  "#": "rock",
  "~": "water",
  P: "plant",
  v: "drain",
  s: "sand",
};

// Levels are written as ASCII so a board reads the same in the source as it
// does on screen, and a bad board is a parse error rather than a puzzle.
export function parseGrid(rows: readonly string[]): Grid {
  const w = rows[0]?.length ?? 0;
  const cells: Cell[] = [];
  for (const row of rows) {
    if (row.length !== w) throw new Error(`row "${row}" is not ${w} wide`);
    for (const glyph of row) {
      const cell = GLYPHS[glyph];
      if (!cell) throw new Error(`unknown glyph "${glyph}"`);
      cells.push(cell);
    }
  }
  return { w, h: rows.length, cells };
}

export function inside(grid: Grid, x: number, y: number): boolean {
  return x >= 0 && x < grid.w && y >= 0 && y < grid.h;
}

// The cell at (x, y), or null off the board.
export function at(grid: Grid, x: number, y: number): Cell | null {
  return inside(grid, x, y) ? grid.cells[y * grid.w + x] : null;
}

export function setCell(grid: Grid, x: number, y: number, cell: Cell): Grid {
  const cells = grid.cells.slice();
  cells[y * grid.w + x] = cell;
  return { ...grid, cells };
}
