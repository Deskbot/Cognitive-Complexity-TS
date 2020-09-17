export class SortedMap<K, V> {
    private map: Map<K, V>;
    readonly sortedKeys: K[];

    constructor(
        map: Map<K, V> = new Map()
    ) {
        this.map = map;
        this.sortedKeys = [...map.keys()];
    }

    get(key: K): V | undefined {
        return this.map.get(key);
    }

    get size(): number {
        return this.sortedKeys.length;
    }

    sort(sorter?: (k1: K, k2: K) => number) {
        this.sortedKeys.sort(sorter);
    }

    /**
     * Returns an iterable of values in the map
     */
    keys(): ReadonlyArray<K> {
        return this.sortedKeys;
    }

    /**
     * Returns an iterable of values in the map
     */
    *values(): IterableIterator<V> {
        for (const key of this.sortedKeys) {
            yield this.map.get(key)!;
        }
    }
}
