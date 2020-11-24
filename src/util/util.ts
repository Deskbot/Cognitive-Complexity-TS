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

export async function doesNotThrow<T>(promise: Promise<T>): Promise<boolean> {
    try {
        await promise;
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Builds an object from a list of keys whose values are based on the key itself,
 * but where that value is produced asynchronously.
 *
 * This function starts by spawning a promise to generate the value for each key,
 * and ends when all values have been produced.
 * This is faster than spawning promises in sequence.
 */
export async function keysToAsyncValues<K extends keyof any, V>(
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

/**
 * Builds an object from a list of input items.
 * The keys and values are derived from the input item,
 * but the values either need to be generated asynchronously or not at all.
 */
export async function createObjectOfPromisedValues<I, K extends keyof any, V>(
    input: I[],
    toKey: (input: I) => K,
    toMaybePromise: (input: I) => Promise<V> | undefined
): Promise<Record<K, V>> {
    const output = {} as Record<K, V>;

    // Create a Promise for each input entry
    // that may perform another asynchronously task to generate a key-value pair.
    // If it does so, that key-value pair is assigned to the output.
    // No key-value will be produced if there is no internal Promise to wait for.

    const promises = input.map(async (inputItem) => {
        const maybePromise = toMaybePromise(inputItem);
        if (maybePromise !== undefined) {
            const key = toKey(inputItem);
            output[key] = await maybePromise;
        }
    });

    // make sure all promises have resolved before returning
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

export function toPromise<T, E>(
    action: (callback: (err: E, successData: T) => void) => void,
    errorTransformer?: (err: E) => Error
): Promise<T> {
    return new Promise((resolve, reject) => {
        action((err, successData) => {
            if (err) {
                reject(errorTransformer ? errorTransformer(err) : err);
            } else {
                resolve(successData);
            }
        });
    });
}

export class Unreachable extends Error {
    constructor(reason: string) {
        super("Unreachable branch.\n" + reason);
    }
}
