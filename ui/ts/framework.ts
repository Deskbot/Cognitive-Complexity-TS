import { Constructor } from "./util";

export interface StatefulNode<T extends any[] = any[]> {
    readonly dom: Node;
    render(...args: [...T]): void;
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

export function constStatefulNode<T extends any[]>(
    StatefulNodeConstructor: Constructor<StatefulNode<T>>,
    ...args: [...T]
) {
    const node = new StatefulNodeConstructor();
    node.render(...args);
    return node.dom;
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
