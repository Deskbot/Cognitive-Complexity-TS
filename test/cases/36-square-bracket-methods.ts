var recursive;

class C {
    [Symbol.iterator]() {
        if (true) {

        }
    }

    [recursive]() {
        this[recursive]();
    }
}
