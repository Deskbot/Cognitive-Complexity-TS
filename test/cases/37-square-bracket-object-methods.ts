var something;
const o = {
    [something]() {
        if (true) {
            this[something]()
        }
    }
}