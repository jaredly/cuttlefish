# Plan: Winner Ranks

## Decisions

- Prize display appears after the player's name.
- Dirt uses the local `dirt.png` asset.
- Dirt overrides any other prize when a player is last.
- In a two-player game, prizes are diamond and dirt.
- In a one-player game, the player gets diamond.
- The last player may continue taking turns after receiving dirt.

## Phase 1: Add Ranking State

Update `src/types.ts`:

- Add a persistent ranking field to `State`, likely `finishOrder: number[]`.
- Keep `Player` unchanged unless implementation shows a strong reason to store rank per player.

Update `newGame` in `src/logic.ts`:

- Initialize `finishOrder: []`.

Add ranking helpers in `src/logic.ts`:

- Keep score-based finish detection for turn skipping:
  - `isPlayerDone(state, player)` remains based on `score.length >= maxPoints`.
- Add a helper to append newly finished players by index.
- Add a helper to detect the last unfinished player and append them to `finishOrder` for dirt once all other players have finished.
- Ensure indexes are appended at most once.

Important behavior:

- A player who reaches `maxPoints` is added to `finishOrder`.
- When exactly one player remains unfinished and at least two players are in the game, append that remaining player to `finishOrder` immediately for dirt.
- Do not treat dirt as "done" for turn-skipping; the dirt player can continue until they reach `maxPoints`.
- For one-player games, do not auto-award dirt before play; the player should receive diamond when they finish.

## Phase 2: Hook Ranking Into Updates

Update `update` in `src/logic.ts`:

- After the action mutates tank/score state, call the ranking helper.
- Call it before `nextActiveTurn`, so newly finished players are skipped on the next turn.

Expected flow:

1. Draw and apply the current action.
2. If the active player crossed `maxPoints`, record their finish order.
3. If this leaves exactly one unfinished player, record that player as last place for dirt.
4. Advance to the next score-unfinished player as today.

Because only the active player's score changes today, this could be narrowly implemented for the active player. Prefer scanning all players because it is simpler and safer if scoring changes later.

## Phase 3: Prize Resolution

Add a prize resolver in `src/logic.ts`.

Suggested return shape:

```ts
type Prize =
    | { kind: "emoji"; label: string; value: string }
    | { kind: "image"; label: string; src: string }
    | null;
```

Rules:

- If `state.players.length === 1`, first place resolves to diamond, not dirt.
- If the player is the last entry in `finishOrder` and there is more than one player, resolve dirt.
- Otherwise resolve by finish index:
  - `0`: diamond emoji
  - `1`: gold emoji
  - `2`: silver emoji
  - `3`: bronze emoji
  - Any other intermediate place: no visible prize

Suggested emoji:

- Diamond: `💎`
- Gold: `🥇`
- Silver: `🥈`
- Bronze: `🥉`

Dirt should render from `dirt.png`, not as an emoji.

## Phase 4: Render Prize After Name

Update the player header in `renderGame` in `src/logic.ts`.

Current location:

```ts
[
    player.name,
    ...
]
```

Change it to render:

- The player name.
- A prize element immediately after the name when a prize is available.

Use `span` for emoji prizes; `framework.ts` already exports it, so update the import:

```ts
import { div, node, render, button, span } from "./framework";
```

For dirt, render an `img` node:

```ts
node("img", {
    src: "/dirt.png",
    title: "Last place",
    alt: "Last place",
    style: {
        width: "1.2em",
        height: "1.2em",
        objectFit: "contain",
    },
})
```

Keep the image inline with the current name row and avoid changing the row height more than necessary.

## Phase 5: Verify Behavior

Static checks:

- Run TypeScript checking, likely `bunx tsc --noEmit` or the repo's equivalent.

Manual checks:

- Start the app with `bun run start`.
- Use a low `maxPoints` value to make ranking quick.
- Check two-player game:
  - First finisher gets diamond.
  - Other player gets dirt immediately.
  - Dirt player can continue until reaching `maxPoints`.
- Check three-player game:
  - First gets diamond.
  - Second gets gold.
  - Remaining player gets dirt immediately.
- Check four-player game:
  - First gets diamond.
  - Second gets gold.
  - Third gets silver.
  - Fourth/last gets dirt, not bronze.
- Check five-player game:
  - First through fourth are diamond/gold/silver/bronze unless fourth is also last.
  - Intermediate finishers after fourth and before last have no prize.
  - Last receives dirt.
- Check one-player game:
  - No dirt is shown at game start.
  - Player receives diamond after finishing.

## Implementation Notes

- Do not rebuild generated files in `build/` unless explicitly requested.
- The current app has no saved-game migration path; all state is created through `newGame`.
- `dirt.png` lives at the repo root, next to `index.html`, so `/dirt.png` should be valid when served from the app root.
- If `finishOrder` is based on player indexes, do not reorder `state.players` during this change.
