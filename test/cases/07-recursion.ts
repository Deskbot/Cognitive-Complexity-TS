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
    f() {
        f();
    },
    g() {
        this.g();
    },
    h() {
        Obj.h();
    },
    i: () => {
        Obj.i()
    }
};
