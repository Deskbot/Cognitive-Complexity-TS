function declaration<T extends true & false>() {}

const expression = function<T extends true & false>() {};

const arrow = <T extends true & false>() => {};

class ClassMethod {
    method<T extends true & false>() {}
}

const objectMethod = <T extends true & false>() => {};
