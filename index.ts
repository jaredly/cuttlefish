import { newGame, renderGame, update } from './src/logic';
import { newGameForm, type SuitTheme } from './src/newGameForm';
import type { State } from './src/types';

// const colors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#a65628', '#f781bf']//, '#999999', '#ffff33'];
// const colors = ['green', 'pink', 'purple', 'red', 'orange', '#ffe900', 'blue'];

const pastels = ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc'];
const colors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#a65628', '#f781bf'];

const run = (state: State) => {
    renderGame(state, async (action) => {
        await update(state, action);
        run(state);
    });
};

let themes: SuitTheme[] = [
    { name: 'Basic', suits: colors.map((color, index) => ({ color, index })) },
    { name: 'Pastels', suits: pastels.map((color, index) => ({ color, index })) },
];
if (localStorage['cuttlefish:themes']) {
    themes = JSON.parse(localStorage['cuttlefish:themes']);
}

// run(state);
newGameForm(
    { maxPoints: 10, suits: themes[2]!.suits, themeName: themes[2]!.name, backSuitCount: 3, startingTankSize: 4 },
    themes,
    ['Person 1', 'Person 2', 'Person 3'],
    (config, names) => {
        run(newGame(config, names));
    },
);
