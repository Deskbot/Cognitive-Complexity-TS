export type Constructor<T, Args extends any[] = any[]> = {
    new(...args: Args): T;
};

export function map<K, V>(keys: K[], mapper: (key: K) => V): Map<K, V> {
    const m = new Map<K,V>();

    keys.forEach((key) => {
        m.set(key, mapper(key));
    });

    return m;
}

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

export function record<K extends string | number, V>(
    list: K[],
    mapper: (key: K) => V
): Record<K, V> {
    const record = {} as Record<K, V>;

    for (const elem of list) {
        record[elem] = mapper(elem);
    }

    return record;
}
