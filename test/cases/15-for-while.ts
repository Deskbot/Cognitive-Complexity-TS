// increment
function f() {
    while (true);
}

function g() {
    for (;;);
}

function h() {
    do {

    } while (true);
}

// nesting level
function i() {
    // depth 0
    while (true) { // +1 +0
        // depth 1
        i(); // +1 for recursion
    }
}

function j() {
    for (; ;) {
        j();
    }
}

function k() {
    do {
        k();
    } while (true);
}

// nesting increment
function l() {
    // depth 0
    while (true) { // +1
        // depth 1
        while (true); // +1 +1
    }
}

function m() {
    for (; ;) {
        while (true);
    }
}

function n() {
    do {
        while (true);
    } while (true);
}