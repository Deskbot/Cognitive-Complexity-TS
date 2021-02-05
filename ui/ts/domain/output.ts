import { FileOutput, FolderOutput } from "../../../shared/types.js";

export function compareOutputs(
    left: FileOutput | FolderOutput,
    right: FileOutput | FolderOutput
): number {
    const leftScore = left.score;
    const rightScore = right.score;

    const leftIsFolder = typeof leftScore === "number";
    const rightIsFolder = typeof rightScore === "number";

    if (leftIsFolder && rightIsFolder) {
        // If the typeof statements were directly in the if condition,
        // the casting would not be required by TypeScript.
        return (rightScore as number) - (leftScore as number);
    }

    if (!leftIsFolder && !rightIsFolder) {
        return 0;
    }

    // folders should be at the bottom of the complexity list

    if (!leftIsFolder) {
        return -1;
    }

    if (!rightIsFolder) {
        return -1;
    }

    return 0; // unreachable
}

export function isFileOutput(output: FileOutput | FolderOutput): output is FileOutput {
    return "score" in output;
}

export function sortFolderByComplexity(folder: FolderOutput) {
    for (const path in folder) {
        const entry = folder[path];

        // FileOutput
        if (isFileOutput(entry)) {
            entry.inner //sort
        }

        // FolderOutput
        else {
            sortFolderByComplexity(entry);
        }
    }
}

export function sortFolderInOrder(folder: FolderOutput) {
    for (const path in folder) {
        const entry = folder[path];

        // FileOutput
        if (isFileOutput(entry)) {
            entry.inner //sort
        }

        // FolderOutput
        else {
            sortFolderInOrder(entry);
        }
    }
}
