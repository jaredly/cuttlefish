import { div, node, render, button } from "./framework";
import { loadBlob } from "./newGameForm";
import type { Suit, Card, State, Action, Player, Config } from "./types";

export const points = (num: number, maxPoints: number) => {
    const cards = [];
    for (let i = 0; i < maxPoints; i++) {
        cards.push(
            div(
                {
                    style: {
                        background: i < num ? "black" : "white",
                        border: "2px solid black",
                        borderRadius: "4px",
                        width: cardWidth / 3 + "px",
                        height: cardHeight / 3 + "px",
                    },
                },
                [],
            ),
        );
    }
    return div(
        {
            style: {
                display: "inline-flex",
                flexDirection: "row",
                gap: "8px",
            },
        },
        cards,
    );
};

export const cardWidth = 100;
export const cardHeight = cardWidth * 1.8;
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

export const renderCardStack = (player: number, suit: Suit, stack: number, highlight: boolean | null, scale = 1) => {
    const shared = {
        // border: `5px solid ${colors[suit]}`,
        // border: `5px solid black`,
        // padding: '8px',
        backgroundColor: suit.color,
        position: "relative",
        margin: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    };

    if (stack === 0 || !suit) {
        return div(
            {
                style: {
                    ...shared,
                    marginInline: 0,
                    width: 0,
                    borderWidth: 0,
                    padding: 0,
                    // transition: '.3s ease margin-inline border width',
                    transitionDuration: ".3s",
                    transitionTimingFunction: "ease",
                    transitionProperty: "margin-inline, border-width, width, padding",
                },
                id: `tank-${player}-${suit.index}`,
                class: `bg-base-100 shadow-sm rounded-lg`,
            },
            [],
        );
    }
    return div(
        {
            style: {
                ...shared,
                transition: "transform .3s ease",
                ...(highlight
                    ? {
                          boxShadow: `
                          white 4px 4px 0,
                          white -4px 4px 0,
                          white 4px -4px 0,
                          white -4px -4px 0,
                          gold 12px 16px 0,
                          gold -12px 16px 0,
                          gold 12px -16px 0,
                          gold -12px -16px 0
                          `,
                          // boxShadow: "8px 8px 2px black",
                          // transform: "translate(-8px, -8px)",
                          // outline: highlight ? "4px solid magenta" : undefined,
                          // outlineOffset: '4px',
                      }
                    : highlight === false
                      ? {
                            transform: "scale(.8,.8)",
                        }
                      : {}),
            },
            id: `tank-${player}-${suit.index}`,
            class: `bg-base-100 shadow-sm rounded-lg`,
        },
        [
            node(
                "svg",
                {
                    width: cardWidth * scale + "px",
                    height: cardHeight * scale + "px",
                },
                [
                    node("defs", [
                        node("clipPath", { id: "circle" }, [
                            node("ellipse", {
                                cx: (cardWidth / 2) * scale,
                                cy: (cardHeight / 2) * scale,
                                rx: (cardWidth / 3) * scale,
                                ry: (cardWidth / 3) * scale,
                                // fill: suit.text ? 'white' : suit.color,
                                // stroke: 'white',
                                // 'stroke-width': '8px',
                            }),
                        ]),
                    ]),
                    //   <defs>
                    //     <clipPath id="cut-off-bottom">
                    //       <rect x="0" y="0" width="200" height="100" />
                    //     </clipPath>
                    //   </defs>
                    node("ellipse", {
                        cx: (cardWidth / 2) * scale,
                        cy: (cardHeight / 2) * scale,
                        rx: (cardWidth / 3) * scale,
                        ry: (cardWidth / 3) * scale,
                        fill: suit.text ? "white" : suit.color,
                        stroke: "white",
                        "stroke-width": "8px",
                    }),
                    suit.picture
                        ? node("image", {
                              "clip-path": "url(#circle)",
                              href: loadBlob(suit.picture),
                              width: (cardWidth / 3) * 2 * scale + "px",
                              height: (cardWidth / 3) * 2 * scale + "px",
                              x: (cardWidth / 2) * scale - (cardWidth / 3) * scale,
                              y: (cardHeight / 2) * scale - (cardWidth / 3) * scale,
                          })
                        : suit.text
                          ? node(
                                "text",
                                {
                                    x: (cardWidth / 2) * scale,
                                    y: (cardHeight / 2) * scale + cardWidth / 5,
                                    "text-anchor": "middle",
                                    "font-size": cardWidth / 2 + "px",
                                },
                                [suit.text],
                            )
                          : null,
                ],
            ),
            stack > 1
                ? div(
                      {
                          style: {
                              position: "absolute",
                              top: "-20px",
                              left: "50%",
                              marginLeft: "-15px",
                              fontWeight: "bold",
                              backgroundColor: "white",
                              width: "30px",
                              height: "30px",
                              textAlign: "center",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "50%",
                              boxShadow: "-1px 1px 5px rgba(0,0,0,0.5)",
                              border: `2px solid ${suit.color}`,
                          },
                      },
                      [stack + ""],
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
    const selfAt = card.back.findIndex((s) => s.index === card.suit.index);
    return div(
        {
            id: "deck-card",
            "data-suit": card.suit,
            style: {
                // border: `5px solid ${colors[card.suit]}`,
                border: `5px solid black`,
                padding: "8px",
                margin: "8px",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "black",
                // gap: '8px',
            },
            class: "bg-base-100 shadow-sm rounded-lg",
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
                "svg",
                {
                    width: cardWidth * 2 + "px",
                    height: cardHeight * 2 + "px",
                    style: { background: card.suit.color },
                },
                [
                    node("defs", [
                        card.back.map((suit, i) =>
                            node("clipPath", { id: "circle" + i }, [
                                node("ellipse", {
                                    cx: cardWidth,
                                    cy: ((cardHeight * 2) / card.back.length) * (i + 0.5),
                                    rx: cardWidth / 3,
                                    ry: cardWidth / 3,
                                }),
                            ]),
                        ),
                    ]),
                    card.back.map((suit, i) => [
                        suit.index === card.suit.index
                            ? null
                            : node("path", {
                                  class: i < selfAt ? "suit-before" : "suit-after",
                                  fill: suit.color,
                                  d: `M0 ${pairs[i]![0]} L${cardWidth * 2} ${pairs[i]![1]}
                        L${cardWidth * 2} ${pairs[i + 1]![1]} L0 ${pairs[i + 1]![0]} Z`,
                              }),
                        node("ellipse", {
                            cx: cardWidth,
                            class: i === selfAt ? "" : i < selfAt ? "suit-before" : "suit-after",
                            cy: ((cardHeight * 2) / card.back.length) * (i + 0.5),
                            rx: cardWidth / 3,
                            ry: cardWidth / 3,
                            fill: "white",
                        }),
                        suit.picture
                            ? node("image", {
                                  class: i === selfAt ? "" : i < selfAt ? "suit-before" : "suit-after",
                                  "clip-path": `url(#circle${i})`,
                                  href: loadBlob(suit.picture),
                                  width: (cardWidth / 3) * 2 + "px",
                                  height: (cardWidth / 3) * 2 + "px",
                                  x: cardWidth - cardWidth / 3,
                                  y: ((cardHeight * 2) / card.back.length) * (i + 0.5) - cardWidth / 3,
                              })
                            : suit.text
                              ? node(
                                    "text",
                                    {
                                        class: i === selfAt ? "" : i < selfAt ? "suit-before" : "suit-after",
                                        x: cardWidth,
                                        y: ((cardHeight * 2) / card.back.length) * (i + 0.5) + cardWidth / 5,
                                        "text-anchor": "middle",
                                        "font-size": cardWidth / 2 + "px",
                                    },
                                    [suit.text],
                                )
                              : null,
                    ]),
                ],
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
export const renderGame = (state: State, update: (action: Action) => void) => {
    render(
        document.body,
        div({ style: { display: "flex", flexDirection: "row", alignItems: "center", height: "100vh", padding: "16px" } }, [
            div(
                {
                    style: {
                        flex: 1,
                        display: "grid",
                        gridTemplateColumns: "1fr max-content",
                        alignItems: "flex-start",
                        justifyContent: "center",
                    },
                },
                [
                    state.players.map((player, i) => [
                        div(
                            {
                                style:
                                    i === state.turn
                                        ? {
                                              outline: "5px dotted magenta",
                                              borderRadius: "10px",
                                          }
                                        : {},
                            },
                            [
                                div(
                                    {
                                        style: {
                                            display: "flex",
                                            flexDirection: "row",
                                            padding: "8px 16px",
                                            fontSize: "1.5em",
                                            fontWeight: "bold",
                                            alignItems: "center",
                                            gap: "8px",
                                        },
                                    },
                                    [player.name, div({ style: { flex: 1 } }, []), points(player.score.length, state.config.maxPoints)],
                                ),
                                div(
                                    {
                                        style: {
                                            display: "flex",
                                            flexDirection: "row",
                                            height: cardHeight + "px",
                                            width: cardWidth * state.config.suits.length + 16 * state.config.suits.length + "px",
                                        },
                                    },
                                    [
                                        ...player.tank.map((cards, suit) =>
                                            renderCardStack(
                                                i,
                                                state.config.suits[suit]!,
                                                // cards[0]?.suit,
                                                cards.length,
                                                state.deck[0]!.back.some((b) => b.index === suit),
                                            ),
                                        ),
                                    ],
                                ),
                            ],
                        ),
                        div({ style: { alignSelf: "anchor-center" } }, [
                            button(
                                {
                                    class: "btn btn-xl btn-" + (i === state.turn ? "primary" : "secondary"),
                                    style: {
                                        marginLeft: "24px",
                                        borderRadius: "4px",
                                    },
                                    onclick() {
                                        update(i === state.turn ? { type: "bank" } : { type: "steal", player: i });
                                        // do a thing idk
                                    },
                                },
                                [i === state.turn ? "Bank" : "Steal"],
                            ),
                        ]),
                    ]),
                ],
            ),
            div(
                {
                    style: {
                        alignSelf: "center",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    },
                },
                [renderCardBack(state.deck[0]!)],
            ),
        ]),
    );
};
const addPlayer = (name: string, state: State) => {
    if (state.players.find((p) => p.name === name)) {
        return false;
    }
    const player: Player = { tank: [], score: [], name };
    state.players.push(player);
    for (let i = 0; i < state.config.suits.length; i++) {
        player.tank.push([]);
    }
    for (let i = 0; i < state.config.startingTankSize; i++) {
        const [got] = state.deck.splice((Math.random() * state.deck.length) | 0, 1);
        player.tank[got!.suit.index]!.push(got!);
    }
    return true;
};
const makeCards = (suits: Suit[], rainbow: number, minCount: number) => {
    let cards: Card[] = [];

    for (let suit = 0; suit < suits.length; suit++) {
        const backs: number[][] = [];
        combinate(rainbow - 1, suits.length, [suit], backs);
        randsort(backs).forEach((back, i) => {
            const at = i % rainbow;
            back.splice(0, 1);
            back.splice(at, 0, suit);
        });
        backs.forEach((back, i) => {
            cards.push({ back: back.map((i) => suits[i]!), suit: suits[suit]!, idx: cards.length, rot: Math.random() });
        });
    }
    if (cards.length < minCount) {
        const orig = cards.slice();
        while (cards.length < minCount) {
            cards.push(...orig);
        }
    }

    return randsort(cards);
};
export const newGame = (config: Config, players: string[]): State => {
    const state: State = {
        config,
        players: [],
        deck: makeCards(config.suits, config.backSuitCount, players.length * 15),
        turn: 0,
    };

    players.forEach((name) => addPlayer(name, state));

    return state;
};

export const update = async (state: State, action: Action) => {
    const card = state.deck.shift()!;
    const player = state.players[state.turn]!;
    await flipDeck();
    switch (action.type) {
        case "bank": {
            if (player.tank[card.suit.index]!.length) {
                await highlightTank(state.turn, card.suit.index);
                player.score.push(card, ...player.tank[card.suit.index]!);
                player.tank[card.suit.index] = [];
            } else {
                await expandTank(state.turn, card.suit.index);
                player.tank[card.suit.index]!.push(card);
            }
            break;
        }
        case "steal": {
            const other = state.players[action.player]!;
            if (other.tank[card.suit.index]!.length) {
                await highlightTank(action.player, card.suit.index);
                player.tank[card.suit.index]!.push(card, ...other.tank[card.suit.index]!);
                other.tank[card.suit.index] = [];
            } else {
                await expandTank(action.player, card.suit.index);
                other.tank[card.suit.index]!.push(card);
            }
            break;
        }
    }
    state.turn += 1;
    state.turn %= state.players.length;
};

const wait = (n: number) => new Promise((res) => setTimeout(res, n));

const flipDeck = async () => {
    const others = document.querySelectorAll(".suit-before,.suit-after");
    others.forEach((other) => {
        const up = other.classList.contains("suit-before");
        const svg = other as SVGElement;
        svg.style.transition = "transform .3s ease-out";
        svg.style.transform = `translate(0, ${up ? -cardHeight * 2 : cardHeight * 2}px)`;
    });
    await wait(500);
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
    pile.style.width = cardWidth + "px";
    pile.style.marginInline = "8px";
    await wait(400);
};

const highlightTank = async (player: number, suit: number) => {
    const pile = document.getElementById(`tank-${player}-${suit}`);
    if (!pile) return;
    // pile.style.outline = `4px solid magenta`;
    pile.style.zIndex = "5";
    pile.style.transitionDuration = ".2s";
    pile.style.transitionTimingFunction = "ease-out";
    pile.style.transform = "perspective(100px) translate3d(-8px, -8px, 30px)";
    await wait(400);
    pile.style.transitionDuration = ".1s";
    pile.style.transitionTimingFunction = "ease-in";
    pile.style.transform = "perspective(100px) translate3d(-8px, -8px, 0px)";
    await wait(200);
};
