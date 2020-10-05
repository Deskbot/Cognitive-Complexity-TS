function parens() {
    ((((((((parens))))))))();
}

class C {
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

const val = function func() {
    (val)();
}

const Obj = {
    bracketedMethodCall() {
        (Obj.bracketedMethodCall)();
    }
};
