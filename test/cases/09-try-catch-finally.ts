function f() {
    try {
    } catch (e) {
    } finally {
    }
}

function g() {
    try {
        // depth 0
        while (true); // +1
    } catch (e) { // +1
        // depth 1
        while (true); // +1 +1
    } finally {
        // depth 0
        while (true); // +1
    }
}

function h() {
    try {
        while (true);
    } catch (e) {
    } finally {
    }
}

function i() {
    try {
    } catch (e) {
        while (true);
    } finally {
    }
}

function j() {
    try {
    } catch (e) {
    } finally {
        while (true);
    }
}

function k() {
    try {
    } catch (e) { // +1
        // depth 1
        try {
        } catch (e) { // +1 +1
        } finally {
        }
    } finally {
    }
}