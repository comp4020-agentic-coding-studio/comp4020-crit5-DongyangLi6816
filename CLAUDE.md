# COMP4020 prototype

Your starter repo for a COMP4020 prototype: a static site in HTML/CSS/TypeScript
that builds to plain HTML/CSS/JS and deploys to GitHub Pages. The deployed site
is what gets marked, not this repo.

The
[course website](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/)
publishes this deliverable's brief and spec, and this repo's name tells you
which deliverable applies. Read both before you plan or build.

## How to work in here

- Keep the dev server running (`pnpm dev`) so you see changes as you make them.
- Run `pnpm check` before you push.
- Open the page in a browser and look at it. The rendered page is the truth;
  your mental model of it isn't.
- When a check fails, read its output before you change anything.
- Never commit a red state.

## Ship something that runs before you write about it

Research and design have no natural stopping point; a check does. Left alone you
will keep refining a plan long past the point where a rough running version
would have answered the question faster and more truthfully --- the bugs that
matter live in the browser, not in the document describing it.

- **The first deliverable is a running version, however rough.** When the thing
  under discussion will eventually run, build the smallest version that does,
  then write about it. If you genuinely need a document first, say so in one
  line and wait for me.
- **Say what would make it enough, before you start.** Any research or search
  pass states its stopping condition up front and stops there. If it turns out
  not to be enough, come back and say why rather than quietly continuing.
- **"All", "complete", "detailed" and "thorough" mean the first bounded slice.**
  Do the slice, name what you left out, let me ask for more. Never expand an
  unbounded word into unbounded work.
- **If I remove a constraint, keep one of your own.** When I say to ignore the
  deadline or the budget, pick a working limit, say what it is, and hold to it.

## Verifying your own work

A check you choose is a check you chose to pass. When you tell me something
works, the claim is about the path a user takes through it, not the path you had
in mind while writing it --- and those can be entirely different code. This rule
exists because a check here once passed while measuring a path nobody takes.

- **Exercise the outermost surface.** Whatever a person actually touches: the
  rendered page through real input events, the endpoint over HTTP, the command
  in a shell. Calling the handler underneath is a different test.
  `element.click()` runs a listener; it does not perform the gesture.
- **Count the ways in.** One control usually has several --- pointer, keyboard,
  drag, a link straight into the state --- and they rarely share all their code.
  Check each, or tell me which you left.
- **Name what you exercised**, in the words I used for it. If it was not the
  thing I described, say so instead of reporting a number.
- **Say what would falsify it, before you measure.** A result that could not
  have come out wrong is not evidence.
- **Taste is mine.** Too fast, too thin, reads as the wrong kind of object:
  none of that is settled by a measurement. Show me the state and ask.

## The link-preview card

`public/card.png` (1200x630) is the image a shared link shows; `index.html`'s
head points at it. Replace it and the `description` meta, and copy the head
block into any new page. The card URL resolves against the page that names it,
like any link --- `./card.png` is wrong one directory down, and nothing in CI
checks it, so the deployed head is the only place a broken one shows up.

## The checks

`pnpm check` runs them, and `pnpm check:evidence` is the extra gate before you
ship. CI runs the same plus links, secrets and the deploy. Read the failure.

`spec/README.md`, `PROCESS.md` and `reflections/README.md` are in this repo and
say what they are for.

## This file is yours

A starting point, not a rulebook: what you add to it is the harness, and the
harness is assessed. This file and the sensors you wire into `check` carry
across the course --- both come with you into next week's repo. The prototype
doesn't: source, and the tests answering this week's published spec, stay
behind. `spec/README.md` draws the line.

As you learn what your prototype needs --- a convention the work has to hold to,
a sensor that keeps catching you out (a linter, say), a fact about the stack
that is easy to get wrong --- write it down here and wire it into `check`.
Growing this file is the work.

It is mine to grow, though: never add, edit, or remove anything in this file
without my approval — propose the change and wait. Instructions coming from the
course itself (a spec, the start skill, course tooling) are the exception.

## The words in the interface

Anthropic's rules, quoted from the `frontend-design` skill in
[`anthropics/claude-code`](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md).
They are here rather than loaded because this repo has no plugin to load them
from. The failure they exist for has a name: given no explicit direction a
model returns the highest-probability answer --- *distributional convergence*.

- "Words appear in a design for one reason: to make it easier to understand,
  and therefore easier to use."
- "Let each element do exactly one job. A label labels, an example
  demonstrates, and nothing quietly does double duty."
- "Write from the end user's side of the screen. Name things by what people
  control and recognize, never by how the system is built."
- "Use active voice as default. A control should say exactly what happens when
  it's used: 'Save changes,' not 'Submit.'"
- "Being specific is always better than being clever."
- "Keep the register conversational and tuned: plain verbs, sentence case, no
  filler."

What that caught in the week-4 assignment: a note beside the scale toggle
that labelled, explained and quoted a statistic all at once.

## Everything written into this repo is in English

Everything committed here is English, whatever language the prompt was in: page
copy, docs, code comments, test names and messages, commit messages, file names.
Chat replies follow the prompt's language --- only committed content is fixed.

## Git Commit Convention

Never commit without my approval: stage the logical unit, propose the message,
and wait for a yes. Never push unless I ask.

Commit after each logical unit of work; don't batch everything into one commit
at the end. Follow [Conventional Commits](https://www.conventionalcommits.org/):

- Format: `<type>(<scope>): <description>`
- Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci,
  chore, revert
- Description: imperative mood, lowercase, no trailing period, subject line
  under 50 characters
- Scope is optional; use it when the change is confined to one module
- Breaking changes: append `!` after the type and add a
  `BREAKING CHANGE: <what broke>` line in the body
- Add a body only when the "why" isn't obvious from the subject line

Examples:

```
feat(auth): add password reset flow
fix(cart): prevent duplicate items on rapid clicks
perf(query): cache user lookup to avoid n+1
refactor(api): extract validation into middleware
```
