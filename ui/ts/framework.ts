import { Constructor } from "./util";

export interface StatefulNode<Muts extends any[] = any[]> {
    readonly dom: Node;
    rerender(...muts: Muts): void;
}

const stylesheetsLinked = new Set<string>();
export function addStyleSheet(path: string) {
    if (stylesheetsLinked.has(path)) {
        return;
    }

    stylesheetsLinked.add(path);
    document.head.appendChild(element("link", {
        href: path,
        rel: "stylesheet",
    }));
}

export function renderImmutably<Muts extends any[]>(
    MutNodeConstructor: Constructor<StatefulNode<Muts>, []>,
    ...args: Muts
) {
    const node = new MutNodeConstructor();
    node.rerender(...args);
    return node.dom;
}

export function constClassToNodeFunc<Consts extends any[]>(
    ConstNodeConstructor: Constructor<StatefulNode<[]>, Consts>,
): (...args: Consts) => Node {
    return (...args) => {
        const node = new ConstNodeConstructor(...args);
        node.rerender();
        return node.dom;
    };
}

export function element<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attrs?: Partial<HTMLElementTagNameMap[K]>,
    inner?: (string | Node)[]
): HTMLElementTagNameMap[K] {
    const elem = document.createElement(tagName);

    if (attrs) {
        for (const key in attrs) {
            // non-nullable assertion is used due to value of Partial being nullable
            elem[key] = attrs[key]!;
        }
    }

    if (inner) {
        elem.append(...inner);
    }

    return elem;
}

export function emptyChildNodes(node: Node) {
    while (node.childNodes.length > 0) {
        node.removeChild(node.childNodes[0]);
    }
}
