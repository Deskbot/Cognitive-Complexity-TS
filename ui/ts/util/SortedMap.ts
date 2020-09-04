export class SortedMap<K, V> {
    private map: Map<K, V>;
    private sorter: (k1: K, k2: K) => number;
    readonly sortedKeys: K[];

    constructor(
        keys: K[],
        sorter: (k1: K, k2: K) => number,
        map: Map<K, V> = new Map()
    ) {
        this.map = map;
        this.sorter = sorter;
        this.sortedKeys = keys;
    }

    clear(): void {
        this.sortedKeys.splice(0, this.sortedKeys.length);
    }

    delete(key: K): boolean {
        const keyIndex = this.sortedKeys.indexOf(key);

        if (keyIndex === -1) return false;

        this.sortedKeys.splice(keyIndex, 1);
        return this.map.delete(key);
    }

    forEach(
        callbackfn: (value: V, key: K, map: Map<K, V>) => void,
        thisArg?: any
    ): void {
        this.map.forEach(callbackfn, thisArg);
    }

    get(key: K): V | undefined {
        return this.map.get(key);
    }

    has(key: K): boolean {
        return this.map.has(key);
    }

    set(key: K, value: V): this {
        const mapSizeBefore = this.map.size;
        this.map.set(key, value);
        const mapSizeAfter = this.map.size;

        if (mapSizeAfter > mapSizeBefore) {
            this.sortedKeys.push(key);
        }

        this.sort();

        return this;
    }

    get size(): number {
        return this.sortedKeys.length;
    }

    private sort() {
        this.sortedKeys.sort(this.sorter);
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
