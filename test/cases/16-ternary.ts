function f() {
    const x = true ? 1 : 0;
}

function g() {
    const x = true
        ? g()
        : g();
}

function h() {
    const x = true
        ? // depth 1
            h() // +1 +1
        : // depth 1
            false // +1 +1
            ? // depth 2
                h() // +1 +2
            : // depth 2
                h(); // +1 +2
}
