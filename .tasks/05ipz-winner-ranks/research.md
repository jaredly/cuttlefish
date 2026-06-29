# Research: Winner Ranks

## Task

Play can continue after the first player reaches the target score. Award rank prizes according to the order players finish:

- First place: diamond
- Second place: gold
- Third place: silver
- Fourth place: bronze
- Intermediate places: no prize
- Last place: dirt

The prize should be shown as an emoji next to the player's name. Once all but one player has finished, the remaining player can receive the dirt prize.

## Current State

Relevant files:

- `src/types.ts`
- `src/logic.ts`
- `index.ts`

Player data currently contains only display/gameplay fields:

```ts
export type Player = {
    name: string;
    tank: Card[][];
    score: Card[];
};
```

There is no persistent win/rank field. A player is considered finished dynamically by score count:

```ts
const isPlayerDone = (state: State, player: Player) =>
    player.score.length >= state.config.maxPoints;
```

Turn advancement already skips finished players via `nextActiveTurn`. If no unfinished players remain, it returns `null`, and `state.turn` is left unchanged. Rendering disables action buttons when no active player remains.

The player header is rendered in `renderGame`, and the name currently appears as a bare text child:

```ts
[
    player.name,
    ...
    points(player.score.length, state.config.maxPoints),
]
```

That is the natural location to add the prize emoji.

Scoring happens only in the `"bank"` branch of `update`, where cards are pushed into the active player's `score`. Stealing and failed banking only change tanks, not score.

## Implementation Direction

Add persistent finish order to game state. The simplest shape is to store the order by player index:

```ts
export type State = {
    config: Config;
    turn: number;
    players: Player[];
    deck: Card[];
    finishOrder: number[];
};
```

Initialize `finishOrder: []` in `newGame`.

After each action mutates state, update finish order before calculating the next active turn:

1. Find players whose score is now at or above `maxPoints`.
2. Append any newly finished players that are not already in `finishOrder`.
3. If exactly one player is still unfinished, ensure that remaining player is appended too, so they receive the last-place dirt prize immediately.

Only the active player appears able to newly reach `maxPoints` in the current rules, because only the active player's score changes. Still, scanning all players is cheap and keeps the logic robust if scoring rules later change.

The last-place behavior should probably append the last unfinished player to `finishOrder` while they are still below `maxPoints`. That means `isPlayerDone` should continue to mean "score has reached max points", while turn progression may need a separate predicate if dirt-awarded players should stop taking turns immediately.

Recommended helpers:

```ts
const finishedByScore = (state: State, player: Player) =>
    player.score.length >= state.config.maxPoints;

const playerPrize = (state: State, playerIndex: number) => {
    const place = state.finishOrder.indexOf(playerIndex);
    if (place === -1) return "";
    if (place === state.players.length - 1) return "🟫"; // or configured dirt emoji
    return ["💎", "🥇", "🥈", "🥉"][place] ?? "";
};
```

Be careful with the fourth-place rule and last-place rule in four-player games. If there are exactly four players, the fourth finisher is also last. The task lists "fourth: bronze" and "last: dirt"; that conflict needs a product decision.

## Turn Flow Consideration

Current `nextActiveTurn` only skips players whose score is at or above `maxPoints`.

If the last remaining player receives dirt as soon as everyone else has finished, then there are two possible behaviors:

- End the game immediately by treating all players in `finishOrder` as no longer active.
- Let the dirt-awarded last player continue taking turns until they also reach `maxPoints`.

The task says "once all but one person has finished, we can award the dirt prize as well." It does not explicitly say whether that player should keep playing. Since the premise is that play continues until all players have "finished", awarding dirt early may imply the game should now be over, because all ranks have been decided.

Implementation can avoid ambiguity by introducing:

```ts
const isPlayerRanked = (state: State, playerIndex: number) =>
    state.finishOrder.includes(playerIndex);
```

Then choose whether active turns skip `finishedByScore` or `isPlayerRanked`.

## Display Direction

Render the prize emoji next to the player's name in the existing name row:

```ts
playerPrize(state, i) ? `${playerPrize(state, i)} ${player.name}` : player.name
```

Or render the emoji as a separate `span` after the name to keep spacing/style controllable:

```ts
player.name,
playerPrize(state, i) ? span({ title: "First place" }, [playerPrize(state, i)]) : null,
```

`framework.ts` exports `span`, so no framework change is needed.

Suggested title labels:

- Diamond: `First place`
- Gold: `Second place`
- Silver: `Third place`
- Bronze: `Fourth place`
- Dirt: `Last place`

## Edge Cases

- More than five players: fifth through next-to-last should receive no prize, but their indexes should still be in `finishOrder` so the last player can be identified.
- Two players: first gets diamond, second/last gets dirt.
- One player: the only player is both first and last. This needs a decision; likely either diamond because they finished first, or dirt immediately because all but one player has finished vacuously.
- Four players: fourth place and last place conflict. See open questions.
- Score can exceed `maxPoints` in one bank action because banking can add multiple cards. That should still count as finishing at that moment.
- `state.turn` remains unchanged after `nextActiveTurn` returns `null`; rendering already disables buttons when no active player exists.
- There is no saved-game migration path in the current app; state is created fresh in `newGame`.

## Testing Notes

There is no test suite in the repo. The practical checks are:

- Run TypeScript checking with `tsc --noEmit` if available.
- Start the app with `bun run start`.
- Create games with 2, 3, 4, and 5+ players and a low `maxPoints` value to manually verify rank assignment and button disabling.

Focused logic tests would be useful if a test harness is added later. The most valuable pure tests would cover:

- Finisher is appended once.
- Last unfinished player gets dirt when only one unfinished remains.
- Intermediate finishers receive no emoji but still contribute to last-place detection.
- Fourth/last behavior after the product decision.

## Open Questions

1. What exact dirt emoji should be used? Options include `🟫` for a dirt-colored square, `💩` if the intent is jokier, or a custom text/icon if "dirt" should be literal.
    - I've added a `dirt.png` for you to use
2. In a four-player game, should the fourth player get bronze, dirt, or both? The prize list assigns both "fourth" and "last" to the same player.
    - dirt overrides any other prize. so in a 2 player game, it's diamond and dirt
3. In a one-player game, should the player get diamond, dirt, both, or should one-player games be disallowed?
    - diamond
4. After dirt is awarded to the last unfinished player, should the game end immediately, or should that player continue until their score reaches `maxPoints`?
    - the last player can continue
5. Should the emoji appear before or after the player's name? The task says "next to"; after the name is less visually disruptive in the current header, while before the name makes rankings easier to scan.
    - after
