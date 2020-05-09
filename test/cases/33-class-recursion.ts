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

const anonymousClass = class {
    method() {
        new anonymousClass();
    }
}

const nameForClass = class NamedClass {
    alias() {
        new nameForClass();
    }

    realName() {
        new NamedClass();
    }
}
