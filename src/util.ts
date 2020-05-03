class EndOfIteratorError extends Error {}

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

export function repeat(str: string, times: number): string {
    let res = "";
    for (let i = 0; i < times; i++) {
        res += str;
    }

    return res;
}

export function sum(a: number, b: number): number {
    return a + b;
}

// TODO retire the need for this
export function throwingIterator<T>(iter: Iterator<T>): () => T {
    return () => {
        const { value, done } = iter.next();

        if (done) throw new EndOfIteratorError();

        return value;
    };
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
