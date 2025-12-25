type A = true;

type B = true | true | true; // series of 1 operator

type C = true | true & false; // series of 2 operators

type D = true | true & false & false | true | true; // series of 3 operators

type E = true & true | false | false & true & true; // series of 3 operators

type F = true | (true | true) | true;

type G = true | (true & false);

function breaksInSequencesOfTypeOperators<T extends true | true = true | true>(param: true | true) // 3
    : T | T // 1
{
    type U<T> = T | (T | T) // 1
    let a: NonNullable<1 | 1> | number | NonNullable<1 | 1> | number // 3
        = 1 | 1 as 1 | 1 as 1 | 1; // 2
    <V extends 1 | number = 1 | 1>(b: 1 | number = 1 | 1): 1 | undefined => { 1 | 1; return undefined } // 4
    function f<X extends T | T = T | T>(arg: T | T): T | T { return true as T | T } // 5
    class C<Y extends T | T> { // 1
        y: T | T = f<any | any>(true as any) // 2
        z<A extends T | T = T | T>(a: T | T): T | undefined { return undefined } // 4
    }
    return true as T
}

type InParentheses = NonNullable<true | true>

type PauseSequenceInParentheses = NonNullable<true | true> | number | NonNullable<true | true> | number
