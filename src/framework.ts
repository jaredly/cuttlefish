// My little framework
const svgTags = ['svg', 'path', 'rect', 'circle', 'ellipse', 'line', 'text'];
export const node = (name: string, attrs: any | null, children?: (HTMLElement | SVGElement)[]) => {
    if (children === undefined && (Array.isArray(attrs) || typeof attrs !== 'object')) {
        children = attrs;
        attrs = null;
    }
    const add = (child: any) => {
        if (child == null) {
            return;
        } else if (Array.isArray(child)) {
            child.forEach(add);
        } else if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
            node.appendChild(document.createTextNode('' + child));
        } else {
            // TODO check, and warn otherwise
            node.appendChild(child);
        }
    };
    const node = svgTags.includes(name) ? document.createElementNS('http://www.w3.org/2000/svg', name) : document.createElement(name);
    if (attrs) {
        Object.keys(attrs).forEach((k) => {
            if (k === 'style') {
                Object.assign(node.style, attrs[k]);
            } else if (['checked', 'value'].includes(k)) {
                node[k as 'nodeValue'] = attrs[k];
            } else if (typeof attrs[k] === 'function') {
                node[k as 'onclick'] = function () {
                    attrs[k].apply(node, arguments);
                }; // todo addeventlistener maybe?
            } else {
                node.setAttribute(k, attrs[k]);
            }
        });
    }
    add(children);
    return node;
};
export const named = (name: string) => (attrs: any, children?: (HTMLElement | SVGElement)[]) => node(name, attrs, children);
export const div = named('div');
export const span = named('span');
export const button = named('button');
export const render = (dest: HTMLElement, node: HTMLElement | SVGElement) => {
    dest.innerHTML = '';
    dest.appendChild(node);
};
// done with framework
