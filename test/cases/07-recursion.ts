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
