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

export function fragment(...children: (string | Node)[]) {
    const fragment = document.createDocumentFragment();
    fragment.append(...children);
    return fragment;
}

export class Observable<T> {
    private handler: ((newValue: T) => void) | undefined;

    constructor(private value: T) {

    }

    get(): T {
        return this.value;
    }

    onChange(handler: (newValue: T) => void) {
        this.handler = handler;
    }

    set(newValue: T) {
        this.value = newValue;

        if (this.handler) {
            this.handler(this.value);
        }
    }
}

export class Store<T extends Unique> {
    private map = new Map<number, Observable<T>>();

    get(id: number): Observable<T> | undefined {
        return this.map.get(id);
    }

    set(item: T) {
        // override content of existing Observable
        if (this.map.has(item.id)) {
            const obs = this.map.get(item.id)!
            obs.set(item);
            return obs;
        }

        // create a new observable
        else {
            const obs = new Observable(item);
            this.map.set(item.id, obs);
            return obs;
        }
    }

    *values(): IterableIterator<T> {
        const iter = this.map.values();

        for (const obs of iter) {
            yield obs.get();
        }
    }
}

export interface Unique {
    id: number;
}

export class UniqueId {
    private static nextId = Number.MIN_SAFE_INTEGER;

    static next() {
        return UniqueId.nextId++;
    }
}
