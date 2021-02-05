import { FileOutput, FolderOutput } from "../../../shared/types.js";

export function compareOutputs(
    left: FileOutput | FolderOutput,
    right: FileOutput | FolderOutput
): number {
    const leftIsFile = isFileOutput(left);
    const rightIsFile = isFileOutput(right);

    if (leftIsFile && rightIsFile) {
        // If the typeof statements were directly in the if condition,
        // the casting would not be required by TypeScript.
        const leftScore = (left as FileOutput).score;
        const rightScore = (right as FileOutput).score;

        return rightScore - leftScore;
    }

    if (!leftIsFile && !rightIsFile) {
        return 0;
    }

    // folders should be at the bottom of the complexity list

    if (!leftIsFile) {
        return -1;
    }

    if (!rightIsFile) {
        return -1;
    }

    return 0; // unreachable
}

export function isFileOutput(output: FileOutput | FolderOutput): output is FileOutput {
    return typeof (output as any).score === "number";
}
