function f() {
    if (true) {
        if (true) {
        } else if (true) {
        } else {
        }
    }
}

function g() {
    if (true) { // +1
        // depth 1
        if (true) { // +1 inherent, +1 for depth
            // depth 2
            while (true); // +1 +2
        } else if (true) { // +1 inherent, +0 despite depth
            // depth 2
            while (true); // +1 +2
        } else { // +1 inherent, +0 despite depth
            // depth 2
            while (true); // +1 +2
        }
    }
}
