function allAnd() {
    true && !true && !!true;
}

function allOr() {
    true || !true || !!true;
}

function allNullCoalescence() {
    true ?? !true ?? !!true;
}

function twoSequences() {
    true && !true && !!true || !true || true;
}

function threeSequences1() {
    true && !true || true && !!true;
}

function threeSequences2() {
    true || !true && true || !!true;
}

function noOp() {
    true;
}

function not() {
    !true
}

function parenthesesSameOperators1() {
    // does not break the sequence
    true && (true && true)
}

function parenthesesSameOperators2() {
    // does not break the sequence
    true && (true && true) && true
}

function parenthesesDifferentOperators1() {
    (true && (true || true)) || true
}

function parenthesesDifferentOperators2() {
    true && ((true || true) || true)
}

function notParentheticalExpression() {
    // breaks the sequence
    true && !(true && true)
}

function functionCalls() {
    // breaks the sequence
    true && Boolean(true && true) && true
}

function otherOperators() {
    true == true != true > true < true >= true <= true
}

function allOtherBreaksInSequenceOfOperators(param = true && true) {
    () => true && true
    function f() { return true && true }
    true && true
    {
        true && true
    }
    true && true
    true && true
    class C {
        param = true && true
        m() {
            true && true
        }
    }
}

function squareBrackets() {
    Math.random() && {}[Math.random() && Math.random()] && Math.random()
}
