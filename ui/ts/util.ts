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

/**
 * Modifies the given array to remove everything matched by the predicate.
 * @returns The items removed from the given array.
 */
export function removeAll<T>(arr: T[], predicate: (elem: T) => boolean): T[] {
    const badIndexes = [] as number[];
    const badElems = [] as T[];

    for (let i = 0; i < arr.length; i++) {
        if (predicate(arr[i])) {
            badIndexes.push(i);
            badElems.push(arr[i]);
        }
    }

    // remove elements from right to left so that the indexes still refer to the same elements

    for (let i = badElems.length - 1; i >= 0; i--) {
        const badIndex = badIndexes[i];
        arr.splice(badIndex, 1);
    }

    return badElems;
}

export type Sorter<T> = (left: T, right: T) => number;
