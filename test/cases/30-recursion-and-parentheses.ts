function parens() {
    (parens)();
}

class C {
    bracketedThis() {
        (this).bracketedThis();
    }

    bracketedCallExpression() {
        (this.bracketedCallExpression)();
    }
}

const k = function l() {
    (l)();
}

class NoParentheses {
    constructor() {
        new NoParentheses;
    }
}

class Parentheses {
    constructor() {
        new (Parentheses);
    }
}

class BracketedThis {
    constructor() {
        (this).constructor();
    }
}

class BracketedConstructor {
    constructor() {
        (this.constructor)();
    }
}

const val = function func() {
    (val)();
}