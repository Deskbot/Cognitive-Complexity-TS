// would be too hard to detect recursion here
var something;
const o = {
    [something]() {
        if (true) {

        }
    }
}