import { div, render } from './src/framework';

type State = {
    players: {
        [name: string]: {
            tank: number[];
            score: number[];
        };
    };
};

type Card = {
    idx: number;
    suit: number;
    back: number[];
};

const suits = 7;
const rainbow = 3;
const cards: Card[] = [];

const colors = ['green', 'pink', 'purple', 'red', 'orange', 'yellow', 'blue'];

const combinate = (left: number, suits: number, path: number[], dest: number[][]) => {
    for (let i = path.length > 1 ? path[path.length - 1]! + 1 : 0; i < suits; i++) {
        if (path.includes(i)) continue;
        if (left === 1) {
            dest.push(path.concat([i]));
        } else {
            combinate(left - 1, suits, path.concat([i]), dest);
        }
    }
};

for (let suit = 0; suit < suits; suit++) {
    const backs: number[][] = [];
    combinate(rainbow - 1, suits, [suit], backs);
    backs.forEach((back) => {
        cards.push({ back, suit, idx: cards.length });
    });
}

console.log('Hello via Bun!');
console.log(cards.length);
render(
    document.body,
    div(
        { style: { display: 'flex', flexWrap: 'wrap' } },
        cards.map((card) =>
            div(
                { style: { border: `5px solid ${colors[card.suit]}`, padding: '8px', margin: '8px' } },
                card.back.map((suit) => div({ style: { background: colors[suit], width: '50px', height: '10px' } })),
            ),
        ),
    ),
);
