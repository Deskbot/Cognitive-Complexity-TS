export function countNotAtTheEnds<T>(arr: T[], count: (elem: T) => boolean): number {
    if (arr.length <= 2) {
        return 0;
    }

    let tot = 0;

    for (let i = 1; i < arr.length - 2; i++) {
        if (count(arr[i])) {
            tot += 1;
        }
    }

    return tot;
}

/**
 * Builds an object from a list of keys whose values are based on the key itself,
 * but where that value is produced asynchronously.
 *
 * This function starts by spawning a promise to generate the value for each key,
 * and ends when all values have been produced.
 * This is faster than spawning promises in sequence.
 */
export async function keysToAsyncValues<K extends string | number, V>(
    keys: K[],
    toValue: (elem: K) => Promise<V>,
): Promise<Record<K, V>> {
    const output = {} as Record<K, V>;

    // Create promises to build the output concurrently.
    // Each promise has a side effect of adding to the output.
    const promises = keys.map(async (key) => {
        output[key] = await toValue(key);
    });

    // Only return when all effects have been applied.
    await Promise.all(promises);

    return output;
}

export function nonNaN(num: number, fallback: number): number {
    if (Number.isNaN(num)) {
        return fallback;
    }

    return num;
}

export function repeat(str: string, times: number): string {
    let res = "";
    for (let i = 0; i < times; i++) {
        res += str;
    }

    return res;
}

export class Unreachable extends Error {
    constructor(reason?: string) {
        let message = "Unreachable branch.";
        if (reason) {
            message += " " + reason;
        }
        super(message);
    }
}
