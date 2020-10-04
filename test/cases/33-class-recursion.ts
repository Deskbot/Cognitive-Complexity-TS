class NewSelf {
    constructor() {
        new NewSelf();
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
