export interface Component {
    dom: HTMLElement;
}

export interface Controller<T> {
    register(component: T): void;
    unregister(component: T): void;
}

export function addStyleSheet(jsUrl: string) {
    const finalDot = jsUrl.length - 3; // ".js" is 3 chars long
    const urlWithoutExtension = jsUrl.substring(0, finalDot);

    document.head.appendChild(element("link", {
        href: urlWithoutExtension + ".css",
        rel: "stylesheet",
    }));
}

export function element<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attrs?: Partial<HTMLElementTagNameMap[K]>,
    ...inner: (string | Node)[]
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
