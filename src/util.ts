export function toPromise<T, E>(
    action: (callback: (err: E | null | undefined, successData: T) => void) => void,
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