import { randomUUID } from "crypto";
import * as deep_diff from "deep-diff";
import * as fs from "fs/promises";
import * as os from "os";

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

export async function tempfile() {
    const path = os.tmpdir() + "/ccts-tests-" + randomUUID()
    await fs.writeFile(path, "")
    return path
}
