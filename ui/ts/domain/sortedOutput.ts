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

// compare

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

// convert

export function convertToSortedOutput(folderOutput: FolderOutput): SortedFolderOutput {
    const m = new Map<string, SortedFileOutput | SortedFolderOutput>();

    for (const key in folderOutput) {
        const value = folderOutput[key];
        if (isFileOutput(value)) {
            m.set(key, value);
        } else {
            m.set(key, convertToSortedOutput(value));
        }
    }

    return new SortedMap(m);
}

// type

function isSortedFileOutput(output: SortedFileOutput | SortedFolderOutput): output is SortedFileOutput {
    return !(output instanceof SortedMap);
}

// sort

function sortFileOrContainer(file: SortedFileOutput | SortedContainerOutput) {
    file.inner.sort();

    for (const container of file.inner) {
        sortFileOrContainer(container);
    }
}

function sortProgram(program: SortedProgramOutput, sorter?: Sorter<string>) {
    program.sort(sorter);

    for (const fileOrFolder of program.values()) {
        if (isSortedFileOutput(fileOrFolder)) {
            sortFileOrContainer(fileOrFolder);
        } else {
            sortProgram(fileOrFolder);
        }
    }
}

export function sortProgramByComplexity(program: SortedProgramOutput) {
    const sorter: Sorter<string> = (left, right) => compareSortedOutputs(
        program.get(left)!,
        program.get(right)!
    );

    sortProgram(program, sorter);
}

export function sortProgramInOrder(program: SortedProgramOutput) {
    sortProgram(program);
}
