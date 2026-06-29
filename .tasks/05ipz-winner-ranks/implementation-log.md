# Implementation Log: Winner Ranks

## Phase 1: Ranking State

- Started from the existing score-based finish model in `src/logic.ts`.
- Added plan to keep turn skipping based on `score.length >= maxPoints` so the dirt-awarded last player can continue playing until they actually finish by score.
- Added `finishOrder: number[]` to `State`.
- Added `recordFinishedPlayers`, which appends score-finished players once and appends the lone remaining unfinished player as last place for dirt in multi-player games.
- Initialized `finishOrder` in `newGame`.

## Phase 2: Update Flow

- Called `recordFinishedPlayers(state)` after applying each action and before calculating the next active turn.
- No workaround needed: the existing turn picker can stay score-based, which preserves the requirement that the dirt player may continue playing.

## Phase 3: Prize Resolution

- Added `playerPrize` to translate `finishOrder` into display prizes.
- Implemented dirt as a display-time override for the last recorded player in multi-player games.
- Preserved the one-player special case: the only player receives diamond after finishing, not dirt.
- Intermediate ranks beyond fourth return no visible prize unless they are the final last-place player.

## Phase 4: Prize Rendering

- Added `renderPrize` and rendered the result immediately after the player's name.
- Emoji prizes use inline `span` elements with title labels.
- Dirt renders as `/dirt.png` with `alt` and `title` set to `Last place`.

## Phase 5: Verification

- Ran `bunx tsc --noEmit`; it passed.
- Tried `bun run start`, but Bun failed to bind port 3000 with `EADDRINUSE`.
- Tried alternate ports 3001 and 3017 with `bun --port ... index.html`; both also failed with `EADDRINUSE`.
- Checked ports 3000, 3001, and 3017 with `curl -I`; no server was reachable.
- Requested approval to run the Bun dev server outside the sandbox for runtime verification; the request was not approved, so browser/runtime verification was not completed.
