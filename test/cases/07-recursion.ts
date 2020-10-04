function f() {
    f();
}

function g() {
    g();
    g();
}

function h() {
    f();
}

class C {
    i() {
        this.i();
    }
}

const k = function l() {
    l();
}

const m = function n() {
    n();
    n();
}

const o = function p() {
    o();
}

const Obj = {
    nonRecursive() {
        nonRecursive();
    },
    recursive() {
        this.recursive();
    },
    recursive2() {
        Obj.recursive2();
    },
    recursive3: () => {
        Obj.recursive3()
    }
};

class Class {
    constructor() {
        Class;
        Class();
        new Class();
    }
}
