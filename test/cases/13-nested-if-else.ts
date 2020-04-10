function f() {
    if (true) {
        if (true) {
        } else if (true) {
        } else {
        }
    }
}

function g() {
    if (true) {
        // depth 1
        if (true) { // +1 +1
            // depth 2
            while (true); // +1 +2
        } else if (true) { // +1
            // depth 2
            while (true); // +1 +2
        } else { // +1
            // depth 2
            while (true); // +1 +2
        }
    }
}
