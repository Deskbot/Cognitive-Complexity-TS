function f() {
    function ff() {

    }
}

function g() {
    const gg = () => {};
}

function h() {
    function hh() {
        while (true);
    }
}

// depth 0
function i() {
    // depth 0
    const ii = () => {
        // depth 1
        while (true); // +1 +1 for depth
    };
}
