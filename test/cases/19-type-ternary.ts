type E<T> = T extends true ? "true" : "false"; // conditional

// nested conditionals
type F<T> = T extends boolean
    ? T extends true // +1 inherent +0 depth
    // depth 1
        ? // +1 inherent +1 depth
            "true" | "t" // +1 inherent
            : "false"
    : "undefined";
