export type Constructor<T, Args extends any[] = any[]> = {
    new(...args: Args): T;
};

export function hasMoreThanOneKey(object: any): boolean {
    let count = 0;

    for (const _ in object) {
        count += 1;
        if (count === 2) {
            return false;
        }
    }

    return true;
}

export function iterMap<T,V>(iter: IterableIterator<T>, mapper: (val: T) => V): V[] {
    const result = [] as V[];

    for (const val of iter) {
        result.push(mapper(val));
    }

    return result;
}

export function mapFromArr<K, V>(keys: K[], mapper: (key: K) => V): Map<K, V> {
    const m = new Map<K, V>();

    keys.forEach((key) => {
        m.set(key, mapper(key));
    });

    return m;
}
