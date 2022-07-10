// would be too hard to detect recursion here
class C {
    [Symbol.iterator]() {
        if (true) {

        }
    }
}
