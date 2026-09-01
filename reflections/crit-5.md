# Crit 5 --- a game

## What was the breakthrough that moved the work forward?

Writing a solver. It walks a board's entire game tree and reports whether the
board can be won, whether it can be lost, how many digs the shortest win takes,
and how many opening moves leave a win reachable. I built it to satisfy one
line of the spec --- that a wrong move is possible --- and it turned out to
answer a question I had been answering by feel: is this level any good?

It paid for itself immediately. My levels felt thin and I could not say why.
The solver said why in one number: every board had exactly one opening that
kept a win reachable. The player was never choosing, only spotting. That is not
something I would have found by playing my own levels, because I already knew
where to dig.

## What did this work change about who I want to be as a software developer?

I want to be the kind of developer who spends a correction rather than
consuming it. Twice this week I caught something by looking at the screen --- a
drain I could not see, a board that never ended --- and both times the cheap
move was available: recolour the cell, patch that one level. Both times the
better move was to change what the work has to satisfy, so the same mistake
cannot come back quietly.

The measure I now trust is not whether the suite is green. It is whether the
suite would have gone red for the thing I just found by hand.
