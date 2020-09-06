import { FileOutput, FolderOutput } from "../../../shared/types";

export function compareOutputs(
    left: FileOutput | FolderOutput,
    right: FileOutput | FolderOutput
): number {
    const leftScore = left.score;
    const rightScore = right.score;

    const leftHasScore = typeof leftScore === "number";
    const rightHasScore = typeof rightScore === "number";

    if (leftHasScore && rightHasScore) {
        // If the typeof statements were directly in the if condition,
        // the casting would not be required by TypeScript.
        return (rightScore as number) - (leftScore as number);
    }

    if (!leftHasScore && !rightHasScore) {
        return 0;
    }

    if (!leftHasScore) {
        return 1;
    }

    if (!rightHasScore) {
        return 1;
    }

    return 0; // unreachable
}
