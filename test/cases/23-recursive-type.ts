type A = {
    attr: A;
};

type B = {
    attr: A;
};

interface C {
    attr: C;
};

interface D {
    attr: C;
};

class E {
    attr: E;
}