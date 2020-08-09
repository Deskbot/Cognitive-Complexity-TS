export type Constructor<T, Args extends any[] = any[]> = {
    new(...args: Args): T;
};
