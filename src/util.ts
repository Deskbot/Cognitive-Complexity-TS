class EndOfIteratorError extends Error {}

export function sum(a: number, b: number): number {
    return a + b;
}

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
