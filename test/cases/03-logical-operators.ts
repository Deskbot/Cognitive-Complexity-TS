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

function parenthesesBreakSequence() {
    true && (true && true)
}

function parenthesesBreakSequence2() {
    true && !(true && true)
}

function parenthesesBreakSequence3() {
    true && (true && true) && true
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

function functionCalls() {
    true && Boolean(true && true) && true
}
