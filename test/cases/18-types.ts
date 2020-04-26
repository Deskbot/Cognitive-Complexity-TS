type A = true;

type B = true | true | true; // series of 1 operator

type C = true | true & false; // series of 2 operators

type D = true | true & false & false | true | true; // series of 3 operators

type E<T> = T extends true ? "true" : "false"; // conditional

// nested conditionals
type F<T> = T extends boolean
    ? T extends true // +1 inherent +0 depth
        // depth 1
        ? // +1 inherent +1 depth
            "true" | "t" // +1 inherent
        : "false"
    : "undefined";

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
