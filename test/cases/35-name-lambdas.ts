function f() {
    const ff = () => {};

    const fff = function() {}

    const g = () => {
        new Promise(() => {

        });
    };

    const h = function() {
        new Promise(() => {

        });
    };

    new Promise(() => {

    });
}
