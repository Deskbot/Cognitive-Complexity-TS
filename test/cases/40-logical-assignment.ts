function andEquals() {
    a &&= true
}

function andEqualsAnd() {
    a &&= true && true
}

function orEquals() {
    a ||= true
}

function orEqualsOr() {
    a ||= true || true
}

function nullCoalesceEquals() {
    a ??= true
}

function nullCoalesceEqualsNullCoalesce() {
    a ??= true ?? true
}