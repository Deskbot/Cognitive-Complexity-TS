type A = true;

type B = true | true | true; // series of 1 operator

type C = true | true & false; // series of 2 operators

type D = true | true & false & false | true | true; // series of 3 operators

type E = true & true | false | false & true & true; // series of 3 operators

type F = true | (true | true) | true;

type G = true | (true & false);
