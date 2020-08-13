export type Constructor<T, Args extends any[] = any[]> = {
    new(...args: Args): T;
};

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
