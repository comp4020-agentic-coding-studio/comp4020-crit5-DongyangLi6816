# Trickle

A small browser game, built for COMP4020 crit 5. Dig a cell of dirt and the
water finds its own way down. It is finite, and a dig cannot be taken back.

Live site: enabled by the course `/ship` skill once this repo goes public.

## Running it

```sh
mise install       # the Node and pnpm this repo is tested against
pnpm install
pnpm dev           # local dev server
pnpm check         # typecheck, build, and the whole suite
pnpm check:crit5   # the above, plus the gates this deliverable adds
pnpm check:evidence
pnpm build         # produce dist/, which is what gets deployed
```

CI runs the same checks plus links, secrets and the Pages deploy, and only
once the repo is public.

## What is in here

- `index.html`, `styles.css`, `main.ts` --- the page and the loop that drives it
- `src/rules/` --- the game itself, as a pure module: no DOM, no clock, no
  randomness. Everything a test needs to play a board through is in here
- `src/ui/` --- drawing a board, and every way in to the one action
- `spec/` --- the shipped invariants, this week's contract tests, and the
  sensors that travel to next week's repo
- `CLAUDE.md` --- the harness an agent works under here
- `PROCESS.md`, `reflections/crit-5.md` --- the process evidence
