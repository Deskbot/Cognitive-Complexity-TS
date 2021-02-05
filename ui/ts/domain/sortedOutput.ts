import { FolderOutput, FunctionNodeInfo, ProgramOutput } from "../../../shared/types.js";
import { SortedMap } from "../util/SortedMap.js";
import { Sorter } from "../util/util.js";
import { isFileOutput } from "./output.js";

export interface SortedContainerOutput extends FunctionNodeInfo {
    score: number;
    inner: SortedContainerOutput[];
}

export interface SortedFileOutput {
    score: number;
    inner: SortedContainerOutput[];
}

export type SortedProgramOutput = SortedFolderOutput;

export type SortedFolderOutput = SortedMap<string, SortedFileOutput | SortedFolderOutput>;

function compareSortedOutputs(
    left: SortedFileOutput | SortedFolderOutput,
    right: SortedFileOutput | SortedFolderOutput
): number {
    const leftIsFile = isSortedFileOutput(left);
    const rightIsFile = isSortedFileOutput(right);

    if (leftIsFile && rightIsFile) {
        // If the typeof statements were directly in the if condition,
        // the casting would not be required by TypeScript.
        const leftScore = (left as SortedFileOutput).score;
        const rightScore = (right as SortedFileOutput).score;

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

export const convertToSortedOutput = convertToSortedFolderOutput;

function convertToSortedFolderOutput(folderOutput: FolderOutput): SortedFolderOutput {
    const m = new Map<string, SortedFileOutput | SortedFolderOutput>();

    for (const key in folderOutput) {
        const value = folderOutput[key];
        if (isFileOutput(value)) {
            m.set(key, value);
        } else {
            m.set(key, convertToSortedFolderOutput(value));
        }
    }

    return new SortedMap(m);
}

function isSortedFileOutput(output: SortedFileOutput | SortedFolderOutput): output is SortedFileOutput {
    return !(output instanceof SortedMap);
}

export function sortFolderByComplexity(folder: SortedFolderOutput) {
    const sorter: Sorter<string> = (left, right) => compareSortedOutputs(
        folder.get(left)!,
        folder.get(right)!
    );

    folder.sort(sorter);
}

const sortContainerInOrder = sortFileInOrder;

function sortFileInOrder(file: SortedFileOutput) {
    file.inner.sort();

    for (const container of file.inner) {
        sortContainerInOrder(container);
    }
}

export function sortFolderInOrder(folder: SortedFolderOutput) {
    folder.sort();

    for (const fileOrFolder of folder.values()) {
        if (isSortedFileOutput(fileOrFolder)) {
            sortFileInOrder(fileOrFolder);
        } else {
            sortFolderInOrder(fileOrFolder);
        }
    }
}
