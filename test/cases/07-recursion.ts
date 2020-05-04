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

const D = {
    j() {
        j();
    }
};

const k = function l() {
    l();
}

const m = function n() {
    n();
    n();
}

const o = function p() {
    p();
}

class NewSelf {
    constructor() {
        new NewSelf();
    }
}

class RecursiveConstructor {
    constructor() {
        this.constructor();
    }
}