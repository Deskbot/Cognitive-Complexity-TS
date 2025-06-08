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

function breaksInSequencesOfTypeOperators<T extends true | true = true | true>(param: true | true) // 3
    : T | T // 1
{
    type U<T> = T | (T | T) // 2
    let a: NonNullable<1 | 1> | number | NonNullable<1 | 1>  // 2
        = 1 | 1 as 1 | 1 as 1 | 1; // 2
    <V extends 1 | number = 1 | 1>(b: 1 | number = 1 | 1): 1 | undefined => { 1 | 1; return undefined } // 4
    function f<X extends T | T = T | T>(arg: T | T): T | T { return true as T | T } // 5
    class C<Y extends T | T> { // 1
        y: T | T // 1
        z<A extends T | T = T | T>(a: T | T): T | undefined { return undefined } // 4
    }
    return true as T
}
