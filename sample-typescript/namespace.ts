export namespace N {

}

namespace M {
    namespace O {
        const a = 1;
        export const b = 2;
    }

    export namespace P {
        const a = 1;
        export const b = 2;
    }
}

declare module name {
    function f(): void;
}

declare module "deep-diff" {
    function f(): void;
}
