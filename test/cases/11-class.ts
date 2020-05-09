class C {
    // nesting 0
}

class D {
    // depth 0
    protected f = () => {
        // depth 0
        while (true);
    }
}

class E {
    // depth 0
    f() {
        // depth 0
        while (true);
    }

    public g() {
        // depth 0
        while (true);
    }
}

const F = class {}

const G = class H {}
