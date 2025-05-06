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

const suits = 7;
const rainbow = 3;
let cards: Card[] = [];
const startingTankSize = 4;

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

const cardWidth = 100;
const cardHeight = cardWidth * 1.8;

const renderCardStack = (player: number, suit: number, stack: number, scale = 1) => {
    const shared = {
        border: `5px solid ${colors[suit]}`,
        backgroundColor: colors[suit],
        // border: `5px solid black`,
        position: 'relative',
        padding: '8px',
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
                        fill: 'white',
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

const renderCardBack = (card: Card) => {
    const r = (Math.PI * cardWidth) / 2 / card.back.length;
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
                gap: '8px',
            },
            class: 'bg-base-100 shadow-sm rounded-lg',
        },
        [
            node(
                'svg',
                {
                    width: cardWidth * 2 + 'px',
                    height: cardHeight * 2 + 'px',
                },
                card.back.map((suit, i) =>
                    node('ellipse', {
                        cx: cardWidth + (Math.cos(((Math.PI * 2) / card.back.length) * i - Math.PI * 2 * card.rot) * cardWidth) / 2,
                        cy: cardHeight + (Math.sin(((Math.PI * 2) / card.back.length) * i - Math.PI * 2 * card.rot) * cardWidth) / 2,
                        rx: r / 2,
                        ry: r / 2,
                        fill: colors[suit],
                        // stroke: 'white',
                        // 'stroke-width': 4,
                    }),
                ),
            ),
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
                                    div({ style: { padding: '8px 16px', fontSize: '1.5em', fontWeight: 'bold' } }, [
                                        player.name,
                                        //
                                        span(
                                            {
                                                style: {
                                                    marginLeft: '16px',
                                                },
                                            },
                                            player.score.length + ' points',
                                        ),
                                    ]),
                                    div({ style: { display: 'flex', flexDirection: 'row' } }, [
                                        ...player.tank.map((cards, suit) => renderCardStack(i, suit, cards.length)),
                                    ]),
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
    const card = document.getElementById('deck-card');
    if (!card) return;
    card.style.transition = 'transform .3s ease-out';
    card.style.transform = 'rotate3d(0, 1, 0, 90deg)';
    await wait(300);
    const newCard = renderCardStack(-1, +card.getAttribute('data-suit')!, 1, 2);
    newCard.style.transform = 'rotate3d(0, 1, 0, 90deg)';
    card.replaceWith(newCard);
    newCard.style.transition = 'transform .3s ease-out';
    await wait(100);
    newCard.style.transform = 'rotate3d(0, 1, 0, 0deg)';
    await wait(300);
};

const expandTank = async (player: number, suit: number) => {
    const pile = document.getElementById(`tank-${player}-${suit}`);
    if (!pile) return;
    pile.style.borderWidth = '5px';
    pile.style.width = cardWidth + 16 + 10 + 'px';
    pile.style.marginInline = '8px';
    pile.style.padding = '8px';
    await wait(400);
};

const highlightTank = async (player: number, suit: number) => {
    const pile = document.getElementById(`tank-${player}-${suit}`);
    if (!pile) return;
    pile.style.outline = `4px solid magenta`;
    pile.style.zIndex = '5';
    pile.style.transitionDuration = '.1s';
    pile.style.transitionTimingFunction = 'ease-out';
    pile.style.transform = 'perspective(100px) translate3d(0, 0, 10px)';
    await wait(200);
    pile.style.transitionTimingFunction = 'ease-in';
    pile.style.transform = 'perspective(100px) translate3d(0, 0, 0px)';
    await wait(200);
};

const update = async (state: State, action: Action) => {
    const card = state.deck.shift()!;
    const player = state.players[state.turn]!;
    await flipDeck();
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
