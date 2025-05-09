import { button, div, node, render, type Child } from './framework';
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

const srcCache: Record<string, string> = {};

export const loadBlob = (fullKey: string) => {
    if (!fullKey) return null;
    if (!srcCache[fullKey]) {
        // const [key, mime] = fullKey.split(':');
        // const src = localStorage[key!];
        // const blob = new Blob([src], { type: mime });
        srcCache[fullKey] = localStorage[fullKey];
        // URL.createObjectURL(blob);
    }
    return srcCache[fullKey];
};

const rescaleImage = async (src: string, size: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const image = new Image();
    await new Promise((res) => {
        image.onload = res;
        image.src = src;
    });
    const w = image.naturalWidth;
    const h = image.naturalHeight;
    const dim = Math.min(w, h);
    // const scale = size / dim
    ctx.drawImage(image, (w - dim) / 2, (h - dim) / 2, dim, dim, 0, 0, size, size);
    return canvas.toDataURL();
};

const imageInput = (value: string | undefined, onChange: (value: string | undefined) => void) => {
    const src = value ? loadBlob(value) : null;
    // let root: HTMLElement | SVGElement
    let root = div({}, [
        src ? node('img', { src, width: '50px', height: '50px' }) : '',
        node('input', {
            type: 'file',
            onchange() {
                console.log(this);
                this.files[0];
                const reader = new FileReader();
                reader.onload = async () => {
                    const dataUrl = reader.result as string;
                    const rescaled = await rescaleImage(dataUrl, 200);
                    const key = 'img-' + Math.random().toString(32).slice(2);
                    localStorage[key] = rescaled;
                    onChange(key);
                    root.replaceWith(imageInput(key, onChange));
                };
                reader.readAsDataURL(this.files[0]);
            },
        }),
        button(
            {
                onclick() {
                    onChange(undefined);
                    root.replaceWith(imageInput(undefined, onChange));
                },
            },
            'Clear',
        ),
    ]);
    return root;
};

const renderSuits = (suits: Suit[], bottomRight?: Child) => {
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
                imageInput(suit.picture, (picture) => {
                    suit.picture = picture;
                }),
                button(
                    {
                        class: 'btn',
                        onclick() {
                            suits.splice(i, 1);
                            suits.forEach((s, i) => (s.index = i));
                            root.replaceWith(renderSuits(suits, bottomRight));
                        },
                    },
                    ['x'],
                ),
            ]);
        }),
        div({}, [
            button(
                {
                    class: 'btn btn-primary',
                    onclick() {
                        suits.push({ color: 'black', index: suits.length });
                        root.replaceWith(renderSuits(suits, bottomRight));
                    },
                },
                'Add suit',
            ),
            bottomRight,
        ]),
    ]);
    return root;
};

export type SuitTheme = { suits: Suit[]; name: string; border?: boolean };

const renderSuitThemeEditor = (
    suitTheme: SuitTheme,
    onSelect: (st: SuitTheme) => void,
    onSave: () => void,
    onDuplicate: () => void,
    onDelete: () => void,
    editing = false,
) => {
    let root: HTMLElement | SVGElement;
    const toggle = () => {
        root!.replaceWith(renderSuitThemeEditor(suitTheme, onSelect, onSave, onDuplicate, onDelete, !editing));
    };
    const shared = { padding: '32px' };
    root = editing
        ? div({ style: shared }, [
              div({ style: { display: 'flex', flexDirection: 'column', padding: '16px', margin: '16px', boxShadow: '1px 1px 3px #aaa' } }, [
                  div({ style: { display: 'flex', flexDirection: 'row', alignItems: 'center' } }, [
                      node('input', {
                          class: 'input',
                          placeholder: 'Theme name',
                          value: suitTheme.name,
                          oninput() {
                              suitTheme.name = this.value;
                          },
                      }),
                      button(
                          {
                              class: 'btn btn-secondary',
                              style: { marginLeft: '16px' },
                              onclick() {
                                  onSave();
                                  toggle();
                              },
                          },
                          ['Save'],
                      ),
                  ]),
                  renderSuits(
                      suitTheme.suits,
                      // button(
                      //     {
                      //         class: 'btn btn-secondary',
                      //         style: { marginLeft: '16px' },
                      //         onclick() {
                      //             allSuits.splice(i + 1, 0, { ...suitTheme, suits: suitTheme.suits.slice() });
                      //             renderSuitsEditor(allSuits, oncomplete);
                      //         },
                      //     },
                      //     ['Clone theme'],
                      // ),
                  ),
              ]),
          ])
        : div({ style: shared }, [
              div({ style: { display: 'flex', flexDirection: 'row', alignItems: 'center' } }, [
                  node('h1', {}, [suitTheme.name]),
                  button(
                      {
                          class: 'btn btn-sm btn-primary',
                          style: { marginLeft: '16px' },
                          onclick() {
                              onSelect(suitTheme);
                          },
                      },
                      ['Select'],
                  ),
                  button(
                      {
                          class: 'btn btn-sm btn-secondary',
                          style: { marginLeft: '16px' },
                          onclick() {
                              toggle();
                          },
                      },
                      ['Edit'],
                  ),
                  button(
                      {
                          class: 'btn btn-sm btn-secondary',
                          style: { marginLeft: '16px' },
                          onclick() {
                              onDuplicate();
                          },
                      },
                      ['Duplicate'],
                  ),
                  button(
                      {
                          class: 'btn btn-sm btn-secondary',
                          style: { marginLeft: '16px' },
                          onclick() {
                              if (confirm('Really delete?')) {
                                  onDelete();
                              }
                          },
                      },
                      ['Delete'],
                  ),
              ]),
              div(
                  { style: { display: 'flex' } },
                  suitTheme.suits.map((suit) => renderCardStack(0, suit, 1, false)),
              ),
          ]);
    return root;
};

const renderSuitsEditor = (allSuits: SuitTheme[], oncomplete: (allSuits: SuitTheme[], selected: SuitTheme) => void) => {
    render(
        document.body,
        div({ style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }, [
            node('h1', { style: { fontSize: '3em', fontWeight: 'bold' } }, 'Themes'),
            allSuits.map(
                (sc, i) =>
                    renderSuitThemeEditor(
                        sc,
                        (sc) => {
                            oncomplete(allSuits, sc);
                        },
                        () => {
                            localStorage['cuttlefish:themes'] = JSON.stringify(allSuits);
                        },
                        () => {
                            allSuits.splice(i + 1, 0, { ...sc, name: sc.name + ' 2' });
                            localStorage['cuttlefish:themes'] = JSON.stringify(allSuits);
                            renderSuitsEditor(allSuits, oncomplete);
                        },
                        () => {
                            allSuits.splice(i, 1);
                            localStorage['cuttlefish:themes'] = JSON.stringify(allSuits);
                            renderSuitsEditor(allSuits, oncomplete);
                        },
                    ),
                // div({ style: { display: 'flex', flexDirection: 'column', padding: '16px', margin: '16px', boxShadow: '1px 1px 3px #aaa' } }, [
                //     div({ style: { display: 'flex', flexDirection: 'row', alignItems: 'center' } }, [
                //         node('input', {
                //             class: 'input',
                //             placeholder: 'Theme name',
                //             value: sc.name,
                //             oninput() {
                //                 sc.name = this.value;
                //             },
                //         }),
                //         button(
                //             {
                //                 class: 'btn btn-secondary',
                //                 style: { marginLeft: '16px' },
                //                 onclick() {
                //                     oncomplete(allSuits, sc);
                //                 },
                //             },
                //             ['Select Theme'],
                //         ),
                //     ]),
                //     renderSuits(
                //         sc.suits,
                //         button(
                //             {
                //                 class: 'btn btn-secondary',
                //                 style: { marginLeft: '16px' },
                //                 onclick() {
                //                     allSuits.splice(i + 1, 0, { ...sc, suits: sc.suits.slice() });
                //                     renderSuitsEditor(allSuits, oncomplete);
                //                 },
                //             },
                //             ['Clone theme'],
                //         ),
                //     ),
                // ]),
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
                    button(
                        {
                            class: 'btn btn-secondary btn-sm',
                            onclick() {
                                renderSuitsEditor(allSuits, (allSuits, selected) => {
                                    // localStorage['cuttlefish:themes'] = JSON.stringify(allSuits);
                                    config.suits = selected.suits;
                                    config.themeName = selected.name;
                                    newGameForm(config, allSuits, players, onComplete);
                                });
                            },
                        },
                        'Change Theme',
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
