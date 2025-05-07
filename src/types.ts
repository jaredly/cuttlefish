export type Player = {
    name: string;
    tank: Card[][];
    score: Card[];
};

export type Action = { type: 'steal'; player: number } | { type: 'bank' };
export type Suit = { index: number; color: string; picture?: string; text?: string };

export type Config = {
    maxPoints: number;
    suits: Suit[];
    backSuitCount: number;
    startingTankSize: number;
};

export type State = {
    config: Config;
    turn: number;
    players: Player[];
    deck: Card[];
};

export type Card = {
    idx: number;
    suit: Suit;
    back: Suit[];
    rot: number;
};
