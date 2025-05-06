import { button, div, node, render, span } from './src/framework';

type Player = {
    name: string;
    tank: Card[][];
    score: Card[];
};

type Action = { type: 'steal'; player: number } | { type: 'bank' };

type State = {
    turn: number;
    players: Player[];
    deck: Card[];
};

type Card = {
    idx: number;
    suit: number;
    back: number[];
    rot: number;
};

const maxPoints = 10;
const suits = 7;
const rainbow = 3;
let cards: Card[] = [];
const startingTankSize = 4;

const colors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#a65628', '#f781bf', '#999999', '#ffff33'];
// const colors = ['green', 'pink', 'purple', 'red', 'orange', '#ffe900', 'blue'];
// const colors = ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'];

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

const cardWidth = 100;
const cardHeight = cardWidth * 1.8;

const renderCardStack = (player: number, suit: number, stack: number, highlight: boolean, scale = 1) => {
    const shared = {
        // border: `5px solid ${colors[suit]}`,
        backgroundColor: colors[suit],
        // border: `5px solid black`,
        position: 'relative',
        // padding: '8px',
        margin: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    };
    if (stack === 0) {
        return div(
            {
                style: {
                    ...shared,
                    marginInline: 0,
                    width: 0,
                    borderWidth: 0,
                    padding: 0,
                    // transition: '.3s ease margin-inline border width',
                    transitionDuration: '.3s',
                    transitionTimingFunction: 'ease',
                    transitionProperty: 'margin-inline, border-width, width, padding',
                },
                id: `tank-${player}-${suit}`,
                class: `bg-base-100 shadow-sm rounded-lg`,
            },
            [],
        );
    }
    return div(
        {
            style: {
                ...shared,
                transition: 'transform .3s ease',
                ...(highlight
                    ? {
                          boxShadow: '8px 8px 2px black',
                          transform: 'translate(-8px, -8px)',
                          // outline: highlight ? '4px solid magenta' : undefined,
                          // outlineOffset: '4px',
                      }
                    : {}),
            },
            id: `tank-${player}-${suit}`,
            class: `bg-base-100 shadow-sm rounded-lg`,
        },
        [
            node(
                'svg',
                {
                    width: cardWidth * scale + 'px',
                    height: cardHeight * scale + 'px',
                },
                [
                    node('ellipse', {
                        cx: (cardWidth / 2) * scale,
                        cy: (cardHeight / 2) * scale,
                        rx: (cardWidth / 3) * scale,
                        ry: (cardWidth / 3) * scale,
                        fill: colors[suit],
                        stroke: 'white',
                        'stroke-width': '8px',
                    }),
                ],
            ),
            stack > 1
                ? div(
                      {
                          style: {
                              position: 'absolute',
                              top: '-20px',
                              left: '50%',
                              marginLeft: '-15px',
                              fontWeight: 'bold',
                              backgroundColor: 'white',
                              width: '30px',
                              height: '30px',
                              textAlign: 'center',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%',
                              boxShadow: '-1px 1px 5px rgba(0,0,0,0.5)',
                              border: `2px solid ${colors[suit]}`,
                          },
                      },
                      [stack + ''],
                  )
                : null,
        ],
    );
};

const rn = (n: number) => (Math.random() - 0.5) * n;

const renderCardBack = (card: Card) => {
    // const r = (Math.PI * cardWidth) / 2 / card.back.length;
    const pairs: [number, number][] = [[0, 0]];
    for (let i = 0; i < card.back.length - 1; i++) {
        const xt = ((cardHeight * 2) / card.back.length) * (i + 1);
        pairs.push([xt + rn(cardHeight / 5), xt + rn(cardHeight / 5)]);
    }
    pairs.push([cardHeight * 2, cardHeight * 2]);
    const selfAt = card.back.indexOf(card.suit);
    return div(
        {
            id: 'deck-card',
            'data-suit': card.suit,
            style: {
                // border: `5px solid ${colors[card.suit]}`,
                border: `5px solid black`,
                padding: '8px',
                margin: '8px',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'black',
                // gap: '8px',
            },
            class: 'bg-base-100 shadow-sm rounded-lg',
        },
        [
            // card.back.map((suit, i) =>
            //     div({
            //         style: {
            //             width: cardWidth * 2 + 'px',
            //             height: (((cardHeight * 2) / card.back.length) | 0) + 'px',
            //             background: colors[suit],
            //         },
            //     }),
            // ),

            node(
                'svg',
                {
                    width: cardWidth * 2 + 'px',
                    height: cardHeight * 2 + 'px',
                    style: { background: colors[card.suit] },
                },
                card.back.map(
                    (suit, i) =>
                        suit === card.suit
                            ? null
                            : node('path', {
                                  class: i < selfAt ? 'suit-before' : 'suit-after',
                                  fill: colors[suit],
                                  d: `M0 ${pairs[i]![0]} L${cardWidth * 2} ${pairs[i]![1]}
                        L${cardWidth * 2} ${pairs[i + 1]![1]} L0 ${pairs[i + 1]![0]} Z`,
                              }),
                    // node('ellipse', {
                    //     cx: cardWidth + (Math.cos(((Math.PI * 2) / card.back.length) * i - Math.PI * 2 * card.rot) * cardWidth) / 2,
                    //     cy: cardHeight + (Math.sin(((Math.PI * 2) / card.back.length) * i - Math.PI * 2 * card.rot) * cardWidth) / 2,
                    //     rx: r / 2,
                    //     ry: r / 2,
                    //     fill: colors[suit],
                    //     // stroke: 'white',
                    //     // 'stroke-width': 4,
                    // }),
                ),
            ),

            // node(
            //     'svg',
            //     {
            //         width: cardWidth * 2 + 'px',
            //         height: cardHeight * 2 + 'px',
            //     },
            //     card.back.map((suit, i) =>
            //         node('ellipse', {
            //             cx: cardWidth + (Math.cos(((Math.PI * 2) / card.back.length) * i - Math.PI * 2 * card.rot) * cardWidth) / 2,
            //             cy: cardHeight + (Math.sin(((Math.PI * 2) / card.back.length) * i - Math.PI * 2 * card.rot) * cardWidth) / 2,
            //             rx: r / 2,
            //             ry: r / 2,
            //             fill: colors[suit],
            //             // stroke: 'white',
            //             // 'stroke-width': 4,
            //         }),
            //     ),
            // ),
        ],
    );
};

const renderGame = (state: State, update: (action: Action) => void) => {
    render(
        document.body,
        div(
            { style: { display: 'flex', flexDirection: 'row', alignItems: 'center', height: '100vh', padding: '16px' } },
            [
                div(
                    {
                        style: {
                            flex: 1,
                            display: 'grid',
                            gridTemplateColumns: '1fr max-content',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                        },
                    },
                    [
                        state.players.map((player, i) => [
                            div(
                                {
                                    style:
                                        i === state.turn
                                            ? {
                                                  outline: '5px dotted magenta',
                                                  borderRadius: '10px',
                                              }
                                            : {},
                                },
                                [
                                    div(
                                        {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'row',
                                                padding: '8px 16px',
                                                fontSize: '1.5em',
                                                fontWeight: 'bold',
                                                alignItems: 'center',
                                                gap: '8px',
                                            },
                                        },
                                        [player.name, div({ style: { flex: 1 } }, []), points(player.score.length)],
                                    ),
                                    div(
                                        {
                                            style: {
                                                display: 'flex',
                                                flexDirection: 'row',
                                                height: cardHeight + 'px',
                                                width: cardWidth * suits + 16 * suits + 'px',
                                            },
                                        },
                                        [
                                            ...player.tank.map((cards, suit) =>
                                                renderCardStack(i, suit, cards.length, state.deck[0]!.back.includes(suit)),
                                            ),
                                        ],
                                    ),
                                ],
                            ),
                            div({ style: { alignSelf: 'anchor-center' } }, [
                                button(
                                    {
                                        class: 'btn btn-xl btn-' + (i === state.turn ? 'primary' : 'secondary'),
                                        style: {
                                            marginLeft: '24px',
                                            borderRadius: '4px',
                                        },
                                        onclick() {
                                            update(i === state.turn ? { type: 'bank' } : { type: 'steal', player: i });
                                            // do a thing idk
                                        },
                                    },
                                    [i === state.turn ? 'Bank' : 'Steal'],
                                ),
                            ]),
                        ]),
                    ],
                ),
                div(
                    {
                        style: {
                            alignSelf: 'center',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        },
                    },
                    [renderCardBack(state.deck[0]!)],
                ),
            ],
            // cards.map((card) => renderCardBack(card)),
        ),
    );
};

const addPlayer = (name: string, state: State) => {
    if (state.players.find((p) => p.name === name)) {
        return false;
    }
    const player: Player = { tank: [], score: [], name };
    state.players.push(player);
    for (let i = 0; i < suits; i++) {
        player.tank.push([]);
    }
    for (let i = 0; i < startingTankSize; i++) {
        const [got] = state.deck.splice((Math.random() * state.deck.length) | 0, 1);
        player.tank[got!.suit]!.push(got!);
    }
    return true;
};

const state: State = {
    players: [],
    deck: cards,
    turn: 0,
};

const wait = (n: number) => new Promise((res) => setTimeout(res, n));

const flipDeck = async () => {
    const others = document.querySelectorAll('.suit-before,.suit-after');
    others.forEach((other) => {
        const up = other.classList.contains('suit-before');
        const svg = other as SVGElement;
        svg.style.transition = 'transform .3s ease-out';
        svg.style.transform = `translate(0, ${up ? -cardHeight * 2 : cardHeight * 2}px)`;
    });
    await wait(300);
};

// const flipDeck = async () => {
//     const card = document.getElementById('deck-card');
//     if (!card) return;
//     card.style.transition = 'transform .3s ease-out';
//     card.style.transform = 'rotate3d(0, 1, 0, 90deg)';
//     await wait(300);
//     const newCard = renderCardStack(-1, +card.getAttribute('data-suit')!, 1, 2);
//     newCard.style.transform = 'rotate3d(0, 1, 0, 90deg)';
//     card.replaceWith(newCard);
//     newCard.style.transition = 'transform .3s ease-out';
//     await wait(100);
//     newCard.style.transform = 'rotate3d(0, 1, 0, 0deg)';
//     await wait(300);
// };

const expandTank = async (player: number, suit: number) => {
    const pile = document.getElementById(`tank-${player}-${suit}`);
    if (!pile) return;
    pile.style.width = cardWidth + 'px';
    pile.style.marginInline = '8px';
    await wait(400);
};

const highlightTank = async (player: number, suit: number) => {
    const pile = document.getElementById(`tank-${player}-${suit}`);
    if (!pile) return;
    // pile.style.outline = `4px solid magenta`;
    pile.style.zIndex = '5';
    pile.style.transitionDuration = '.2s';
    pile.style.transitionTimingFunction = 'ease-out';
    pile.style.transform = 'perspective(100px) translate3d(-8px, -8px, 30px)';
    await wait(400);
    pile.style.transitionDuration = '.1s';
    pile.style.transitionTimingFunction = 'ease-in';
    pile.style.transform = 'perspective(100px) translate3d(-8px, -8px, 0px)';
    await wait(200);
};

const update = async (state: State, action: Action) => {
    const card = state.deck.shift()!;
    const player = state.players[state.turn]!;
    flipDeck();
    switch (action.type) {
        case 'bank': {
            if (player.tank[card.suit]!.length) {
                await highlightTank(state.turn, card.suit);
                player.score.push(card, ...player.tank[card.suit]!);
                player.tank[card.suit] = [];
            } else {
                await expandTank(state.turn, card.suit);
                player.tank[card.suit]!.push(card);
            }
            break;
        }
        case 'steal': {
            const other = state.players[action.player]!;
            if (other.tank[card.suit]!.length) {
                await highlightTank(action.player, card.suit);
                player.tank[card.suit]!.push(card, ...other.tank[card.suit]!);
                other.tank[card.suit] = [];
            } else {
                await expandTank(action.player, card.suit);
                other.tank[card.suit]!.push(card);
            }
            break;
        }
    }
    state.turn += 1;
    state.turn %= state.players.length;
};

['james', 'selina', 'jared'].forEach((name) => addPlayer(name, state));

const points = (num: number) => {
    const cards = [];
    for (let i = 0; i < maxPoints; i++) {
        cards.push(
            div(
                {
                    style: {
                        background: i < num ? 'black' : 'white',
                        border: '2px solid black',
                        borderRadius: '4px',
                        width: cardWidth / 3 + 'px',
                        height: cardHeight / 3 + 'px',
                    },
                },
                [],
            ),
        );
    }
    return div(
        {
            style: {
                display: 'inline-flex',
                flexDirection: 'row',
                gap: '8px',
            },
        },
        cards,
    );
};

const rerender = () => {
    renderGame(state, async (action) => {
        console.log('doing a thing');
        await update(state, action);
        console.log('done it');
        rerender();
    });
};

rerender();

// render(
//     document.body,
//     div(
//         { style: { display: 'flex', flexWrap: 'wrap' } },
//         cards.map((card) => renderCardBack(card)),
//     ),
// );
