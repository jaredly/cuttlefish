import { div, node, render } from './src/framework';

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
    rot: number;
};

const suits = 7;
const rainbow = 3;
let cards: Card[] = [];

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

const randsort = <T>(a: T[]): T[] => {
    return a
        .map((v) => [v, Math.random()] as const)
        .sort((a, b) => a[1] - b[1])
        .map((a) => a[0]);
};

for (let suit = 0; suit < suits; suit++) {
    const backs: number[][] = [];
    combinate(rainbow - 1, suits, [suit], backs);
    randsort(backs).forEach((back, i) => {
        const at = i % rainbow;
        back.splice(0, 1);
        back.splice(at, 0, suit);
    });
    backs.forEach((back, i) => {
        cards.push({ back, suit, idx: cards.length, rot: Math.random() });
    });
}

cards = randsort(cards);

const renderCard = (card: Card) => {
    const size = 300;
    const r = (Math.PI * size) / 4 / card.back.length;
    return div(
        {
            style: {
                border: `5px solid ${colors[card.suit]}`,
                padding: '8px',
                margin: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
            },
            class: 'bg-base-100 shadow-sm rounded-lg',
        },
        [
            node(
                'svg',
                {
                    width: size + 'px',
                    height: size + 'px',
                },
                card.back.map((suit, i) =>
                    node('ellipse', {
                        cx: size / 2 + (Math.cos(((Math.PI * 2) / card.back.length) * i - Math.PI * 2 * card.rot) * size) / 4,
                        cy: size / 2 + (Math.sin(((Math.PI * 2) / card.back.length) * i - Math.PI * 2 * card.rot) * size) / 4,
                        rx: r / 2,
                        ry: r / 2,
                        fill: colors[suit],
                    }),
                ),
            ),
        ],
    );
};

render(
    document.body,
    div(
        { style: { display: 'flex', flexWrap: 'wrap' } },
        cards.map((card) => renderCard(card)),
    ),
);
