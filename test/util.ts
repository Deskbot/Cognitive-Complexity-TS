import * as deep_diff from "deep-diff";

export function compare(expected: any, actual: any): any[] | undefined {
    const differences = deep_diff.diff(expected, actual);

    if (differences === undefined) {
        return undefined;
    }

    return differences.map(renameKeys);
}

function renameKeys(diff: any) {
    const newDiff = {
        ...diff,
        expected: diff.lhs,
        actual: diff.rhs,
    };

    delete newDiff.lhs;
    delete newDiff.rhs;

    return newDiff;
}
