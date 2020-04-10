function f() {
    while (true);
}

const g = () => {
    while (true);
};

namespace N {
    function f() {
        while (true);
    }
}

class C {
    // depth 0
    f = () => {
        // depth 0
        while (true); // +1
    }

    g() {
        // depth 0
        while (true); // +1
    }
}