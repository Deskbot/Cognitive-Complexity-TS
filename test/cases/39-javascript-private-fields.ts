class A {
    #b() {
        return this.#b();
    }

    get #c() {
        return true && false;
    }

    static #d() {
        return true && false;
    }

    static #e = () => { return true && false; }

    static #f = function () { return true && false; }
}