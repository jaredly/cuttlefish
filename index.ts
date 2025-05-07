import { newGame, renderGame, update } from './src/logic';
import type { State } from './src/types';

// const colors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#a65628', '#f781bf']//, '#999999', '#ffff33'];
// const colors = ['green', 'pink', 'purple', 'red', 'orange', '#ffe900', 'blue'];
// const colors = ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'];

const colors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#a65628', '#f781bf'];
const state = newGame(
    {
        maxPoints: 10,
        suits: colors.map((color, i) => ({ color, index: i })),
        backSuitCount: 3,
        startingTankSize: 4,
    },
    ['james', 'selina', 'jared'],
);

const run = (state: State) => {
    renderGame(state, async (action) => {
        await update(state, action);
        run(state);
    });
};

run(state);
