function f() {
    const x = true ? 1 : 0;
}

function g() {
    const x = true
        ? g()
        : g();
}

function h() {
    // depth 0
    const x = true // +1 inherent +0 depth
        ?
            h() // +1 inherent
        :
            false // +1 inherent +1 depth
            ?
                h() // +1 inherent
            :
                h(); // +1 inherent
}
