export class SortedMap<K, V> {
    private map: Map<K, V>;
    private sorter: (k1: K, k2: K) => number;
    readonly sortedKeys: K[];

    constructor(
        map: Map<K, V> = new Map()
    ) {
        this.map = map;
        this.sorter = () => 1;
        this.sortedKeys = [...map.keys()];
    }

    get(key: K): V | undefined {
        return this.map.get(key);
    }

    get size(): number {
        return this.sortedKeys.length;
    }

    sort(sorter?: (k1: K, k2: K) => number) {
        if (sorter) {
            this.sorter = sorter;
        }
        this.sortedKeys.sort(this.sorter);
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
