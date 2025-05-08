import { button, div, node, render } from './framework';
import { renderCardStack } from './logic';
import type { Config, Suit } from './types';

const renderNames = (names: string[]) => {
    let root = div({ style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }, [
        div({ style: { marginBottom: '16px', display: 'flex', flexDirection: 'row', alignItems: 'center' } }, [
            div({ style: { fontSize: '1.5em' } }, 'Players'),
            button(
                {
                    class: 'btn btn-sm btn-secondary',
                    style: { marginLeft: '16px' },
                    onclick() {
                        names.push('My Friend');
                        root.replaceWith(renderNames(names));
                    },
                },
                'Add player',
            ),
        ]),
        names.map((name, i) => {
            return div({ style: { display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '8px', gap: '8px' } }, [
                node(
                    'input',
                    {
                        class: 'input',
                        value: name,
                        oninput(evt: KeyboardEvent) {
                            names[i] = (evt.target as HTMLInputElement).value;
                        },
                    },
                    [],
                ),
                button(
                    {
                        class: 'btn',
                        onclick() {
                            names.splice(i, 1);
                            root.replaceWith(renderNames(names));
                        },
                    },
                    ['x'],
                ),
            ]);
        }),
    ]);
    return root;
};

const renderSuits = (suits: Suit[]) => {
    let root = div({}, [
        div({}, 'Suits'),
        suits.map((suit, i) => {
            return div({ style: { display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '8px', gap: '8px' } }, [
                node(
                    'input',
                    {
                        class: 'input',
                        type: 'color',
                        value: suit.color,
                        style: { width: '4em' },
                        oninput(evt: KeyboardEvent) {
                            suit.color = (evt.target as HTMLInputElement).value;
                        },
                    },
                    [],
                ),
                node(
                    'input',
                    {
                        class: 'input',
                        value: suit.text ?? '',
                        style: { width: '10em' },
                        oninput(evt: KeyboardEvent) {
                            suit.text = (evt.currentTarget as HTMLInputElement).value;
                        },
                    },
                    [],
                ),
                node(
                    'input',
                    {
                        class: 'input',
                        value: suit.picture ?? '',
                        style: { width: '3em' },
                        oninput(evt: KeyboardEvent) {
                            suit.text = (evt.currentTarget as HTMLInputElement).value;
                        },
                    },
                    [],
                ),
                button(
                    {
                        class: 'btn',
                        onclick() {
                            suits.splice(i, 1);
                            suits.forEach((s, i) => (s.index = i));
                            root.replaceWith(renderSuits(suits));
                        },
                    },
                    ['x'],
                ),
            ]);
        }),
        button(
            {
                class: 'btn btn-primary',
                onclick() {
                    suits.push({ color: 'black', index: suits.length });
                    root.replaceWith(renderSuits(suits));
                },
            },
            'Add suit',
        ),
    ]);
    return root;
};

export type SuitTheme = { suits: Suit[]; name: string };

const renderSuitsEditor = (allSuits: SuitTheme[], oncomplete: (allSuits: SuitTheme[]) => void) => {
    render(
        document.body,
        div({ style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }, [
            node('h1', { style: { fontSize: '3em', fontWeight: 'bold' } }, 'Themes'),
            allSuits.map((sc, i) =>
                div({ style: { display: 'flex', flexDirection: 'column', padding: '16px', margin: '16px', boxShadow: '1px 1px 3px #aaa' } }, [
                    div({ style: { display: 'flex', flexDirection: 'row', alignItems: 'center' } }, [
                        node('input', {
                            class: 'input',
                            placeholder: 'Theme name',
                            value: sc.name,
                            oninput() {
                                sc.name = this.value;
                            },
                        }),

                        button(
                            {
                                class: 'btn btn-primary',
                                style: { marginLeft: '16px' },
                                onclick() {
                                    allSuits.splice(i + 1, 0, { ...sc, suits: sc.suits.slice() });
                                    renderSuitsEditor(allSuits, oncomplete);
                                },
                            },
                            ['Clone theme'],
                        ),
                    ]),
                    renderSuits(sc.suits),
                ]),
            ),
            button(
                {
                    class: 'btn btn-primary',
                    style: { marginBottom: '16px' },
                    onclick() {
                        allSuits.push({ name: 'New Theme', suits: [{ color: 'red', index: 0 }] });
                        renderSuitsEditor(allSuits, oncomplete);
                    },
                },
                ['Add theme'],
            ),
            button(
                {
                    class: 'btn btn-secondary',
                    style: { marginBottom: '100px' },
                    onclick() {
                        oncomplete(allSuits);
                    },
                },
                ['Return'],
            ),
        ]),
    );
};

export const newGameForm = (config: Config, allSuits: SuitTheme[], players: string[], onComplete: (config: Config, players: string[]) => void) => {
    render(
        document.body,
        div(
            {
                style: {
                    inset: '100px',
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: '16px',
                },
            },
            [
                node('h1', { style: { fontSize: '3em', fontWeight: 'bold' } }, 'Cuttlefish'),
                div({}, [
                    node(
                        'select',
                        {
                            value: config.themeName,
                            onchange() {
                                const sc = allSuits.find((sc) => sc.name === this.value);
                                if (!sc) return;
                                config.suits = sc.suits;
                                config.themeName = sc.name;
                                newGameForm(config, allSuits, players, onComplete);
                            },
                        },
                        allSuits.map((sc) => node('option', { value: sc.name }, [sc.name])),
                    ),
                    button(
                        {
                            class: 'btn btn-secondary btn-sm',
                            style: { marginLeft: '32px' },
                            onclick() {
                                renderSuitsEditor(allSuits, (allSuits) => {
                                    localStorage['cuttlefish:themes'] = JSON.stringify(allSuits);
                                    newGameForm(config, allSuits, players, onComplete);
                                });
                            },
                        },
                        'Edit Themes',
                    ),
                ]),
                div(
                    { style: { display: 'flex' } },
                    config.suits.map((suit) => renderCardStack(0, suit, 1, false)),
                ),
                renderNames(players),
                button(
                    {
                        class: 'btn btn-primary',
                        onclick() {
                            onComplete(config, players);
                        },
                    },
                    'Start Game',
                ),
            ],
        ),
    );
};
