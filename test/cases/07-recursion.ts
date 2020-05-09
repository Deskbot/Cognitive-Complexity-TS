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
        D.j();
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
    o();
}
