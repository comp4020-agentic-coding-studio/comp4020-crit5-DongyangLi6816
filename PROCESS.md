# Process overview

## What I built

**Trickle**, a browser game with one action: dig a cell of dirt, and the water
finds its own way down to a thirsty plant. The water is finite and a dig cannot
be taken back, so every click spends something. Five boards --- three teach one
mechanic each, wordlessly, and two ask for a plan.

## The moments that mattered

**The way out of the board was invisible.** Playing level 2, I could not tell
which channel led off the bottom edge; it looked like every other dark square.
The obvious fix was a brighter colour. Instead I moved the rule onto the board:
every edge became a wall, and water now only leaves down a drain the level
draws, before you go anywhere near it.
[`837a99a`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-DongyangLi6816/commit/837a99a)

**A board could stop being winnable without ever ending.** Designing a level
where sand can be aimed the wrong way, the page simply sat there --- water at
rest somewhere useless, nothing left that would move it. Rather than patch that
one board, I made it a rule: nothing left to dig and a thirsty plant is a loss.
Now "play ends somewhere" is true of every board, not just the ones I checked.
[`349c60c`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-DongyangLi6816/commit/349c60c)

**The suite was green while the game was a guessing game.** Told the levels
were too easy, I wrote a solver that walks each board's whole game tree, and it
named the fault my eyes had not: every level had exactly one opening that kept
a win reachable. So the fix went into `check`, not into the levels alone ---
teaching boards must stay winnable in two digs, the rest must need four and
leave three openings alive.
[`76c724e`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-DongyangLi6816/commit/76c724e)
