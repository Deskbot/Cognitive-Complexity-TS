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

function parenthesesAroundASequenceBreak() {
    true && (true || true)
}
