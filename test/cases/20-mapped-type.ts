type G<T extends string> = {
    [K in T]: true; // iteration
};

// iterative condition
type H<T extends string> = {
    [K in T]: K extends boolean ? "t" : "f";
};

// conditional iteration
type I<T extends string> = T extends boolean
    ? {
        [K in T]: boolean;
    }
    : never;
