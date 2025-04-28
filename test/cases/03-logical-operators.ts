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

function threeSequences() {
    true && !true || !!true || true && !!true;
}

function noOp() {
    true;
}

function parenthesesDoesNotBreakSequence() {
    true && (true && true)
}

function notBreaksSequence() {
    true && !(true && true)
}

function parenthesesAroundASequenceBreak() {
    true && (true || true)
}

function parenthesesBreakSequence() { // && is child of || due to precedence
    true && (true && true || true)
}

function sequenceInParentheses1() {
    true && (true || true && true)
}

function sequenceInParentheses2() {
    true || (true && true || true)
}

function sequenceInParentheses3() {
    true || (true || true && true)
}

function sequenceInParentheses4() {
    true && (true || true) && true
}

function parenthesesBreakingOneSequenceButNotAnother() {
    true && (true && true) || true
}

function parenthesesBreakingTwoSequences() {
    true || (true || true) && true
}

function otherOperators() {
    true == true != true > true < true >= true <= true
}
