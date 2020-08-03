export function addStyleSheet(path: string) {
    document.head.appendChild(element("link", {
        href: path,
        rel: "stylesheet",
    }));
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

export function fragment(elems: Node[]): DocumentFragment {
    const frag = document.createDocumentFragment();
    frag.append(...elems);
    return frag;
}
