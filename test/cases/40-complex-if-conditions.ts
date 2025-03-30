function simpleSingleCondition() {
    if (true) {
        // do something
    }
}

function singleBooleanNegation() {
    if (!true) {
        // do something
    }
}

function multipleAndConditions() {
    if (condition1 && condition2 && condition3) {
        // do something
    }
}

function multipleOrConditions() {
    if (condition1 || condition2 || condition3) {
        // do something
    }
}

function mixedAndOrConditions() {
    if (condition1 && condition2 || condition3 && condition4) {
        // do something
    }
}

function complexParenthesizedConditions() {
    if (condition1 && (condition2 || condition3) && condition4) {
        // do something
    }
}

function negatedComplexConditions() {
    if (val > someConstant && (condition2 || condition3) && !condition4 && !condition5 || val < someOtherConstant) {
        // do something
    }
}

function elseIfWithComplexConditions() {
    if (val > someConstant && condition2) {
        // do something
    } else if (val < someOtherConstant || !condition3) {
        // do something else
    }
}

let condition1, condition2, condition3, condition4, condition5, val, someConstant, someOtherConstant;