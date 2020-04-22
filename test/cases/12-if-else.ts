function f() {
    if (true) {
    } else if (true) {
    } else {
    }
}

function g() {
    // depth 0
    if (true) { // +1
        // depth 1
        while (true); // +1 +1
    } else if (true) { // +1
        // depth 1
        while (true); // +1 +1
    } else { // +1
        // depth 1
        while (true); // +1 +1
    }
}

function h() {
    if (true) {
    }
}


function i() {
    if (true) {
    } else if (true) {
    }
}

function j() {
    if (true) {
    } else {

    }
}
