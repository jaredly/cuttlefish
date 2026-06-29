# Implementation Log

- Added completed-player detection based on `score.length >= config.maxPoints`.
- Updated turn advancement so each completed player is skipped after a move.
- Preserved stealing from completed players by keeping their row button as a `Steal` action when another player is active.
- Added a defensive all-players-complete state that disables action buttons instead of looping forever.
- Issues/workarounds: the local DOM helper treats any present `disabled` attribute as disabled, even `disabled="false"`, so the implementation only emits the attribute in the all-done state.
- Issues/workarounds: there was no existing test suite in the repo, so verification was done with TypeScript checks and code inspection.
