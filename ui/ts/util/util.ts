export function arrayToMap<K, V>(keys: K[], mapper: (key: K) => V): Map<K, V> {
    const m = new Map<K, V>();

    keys.forEach((key) => {
        m.set(key, mapper(key));
    });

    return m;
}

export function computeOnce<T>(func: () => T): () => T {
    let result: T;
    let notComputed = true;
    return () => {
        if (notComputed) {
            result = func();
            notComputed = false;
        }
        return result;
    };
}

export function iterMap<T,V>(iter: IterableIterator<T>, mapper: (val: T) => V): V[] {
    const result = [] as V[];

    for (const val of iter) {
        result.push(mapper(val));
    }

    return result;
}

export type Sorter<T> = (left: T, right: T) => number;
