function declaration<T extends true & false>();
function declaration<T>() {

}

abstract class ClassWithDeclarations {
    abstract abs<T extends true & false>(): void;
    abstract abs<T>(): void;

    method<T extends true & false>();
    method<T>() {

    }
}

class GenericClass<T extends true & false> {

}