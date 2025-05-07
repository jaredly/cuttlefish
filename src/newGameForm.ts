import { button, div, node, render } from './framework';
import type { Config } from './types';

const renderNames = (names: string[]) => {
    let root = div({}, [
        div({}, 'Players'),
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
        button(
            {
                class: 'btn btn-primary',
                onclick() {
                    names.push('My Friend');
                    root.replaceWith(renderNames(names));
                },
            },
            'Add player',
        ),
    ]);
    return root;
};

const renderSuits = (config: Config) => {
    let root = div({}, [
        div({}, 'suits'),
        config.suits.map((suit, i) => {
            let bgc;

            return div({ style: { display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '8px', gap: '8px' } }, [
                (bgc = div(
                    {
                        style: {
                            width: '2em',
                            height: '2em',
                            backgroundColor: suit.color,
                        },
                    },
                    [],
                )),
                node(
                    'input',
                    {
                        class: 'input',
                        value: suit.color,
                        oninput(evt: KeyboardEvent) {
                            suit.color = (evt.target as HTMLInputElement).value;
                            bgc.style.backgroundColor = suit.color;
                        },
                    },
                    [],
                ),
                button(
                    {
                        class: 'btn',
                        onclick() {
                            config.suits.splice(i, 1);
                            config.suits.forEach((s, i) => (s.index = i));
                            root.replaceWith(renderSuits(config));
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
                    config.suits.push({ color: 'black', index: config.suits.length });
                    root.replaceWith(renderSuits(config));
                },
            },
            'Add suit',
        ),
    ]);
    return root;
};

export const newGameForm = (config: Config, players: string[], onComplete: (config: Config, players: string[]) => void) => {
    render(
        document.body,
        div({}, [
            node('h1', 'Hello Folks'),
            renderSuits(config),
            renderNames(players),
            button(
                {
                    class: 'btn btn-primary',
                    onclick() {
                        onComplete(config, players);
                    },
                },
                'Ok folks',
            ),
        ]),
    );
};
