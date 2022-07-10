var property;

class Getter {
    // depth 0
    get f(): string {
        // depth 0
        return this.f; // +1 for recursion
    }

    // depth 0
    get [property](): string {
        // depth 0
        return this[property]; // +1 for recursion
    }
}

class Setter {
    set f(value) {
        this.f = 1;
    }

    set [property](value) {
        this[property] = 1;
    }
}
