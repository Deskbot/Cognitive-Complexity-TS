var property;

class Getter {
    // depth 0
    get f(): string {
        // depth 0
        return this.f; // +1 for recursion
    }

    get [property](): string {
        // just trying to prove it doesn't fall over
        // not worth figuring out whether there's recursion here
        return ""
    }
}

class Setter {
    set f(value) {
        this.f = 1;
    }

    set [property](value) {
        // just trying to prove it doesn't fall over
        // not worth figuring out whether there's recursion here
    }
}
