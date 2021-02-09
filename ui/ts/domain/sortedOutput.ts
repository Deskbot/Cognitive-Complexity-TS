import { ContainerOutput, FileOutput, FolderOutput, FunctionNodeInfo, ProgramOutput } from "../../../shared/types.js";
import { Sorter } from "../util/util.js";
import { isFileOutput } from "./output.js";
import { concatFilePath } from "./path.js";

// type

export interface SortedContainerOutput extends FunctionNodeInfo {
    name: string;
    path: string;
    score: number;
    inner: SortedContainerOutput[];
}

export interface SortedFileOutput {
    name: string;
    path: string;
    score: number;
    inner: SortedContainerOutput[];
}

export type SortedProgramOutput = SortedFolderOutput;

export interface SortedFolderOutput {
    name: string;
    path: string;
    inner: (SortedFileOutput | SortedFolderOutput)[];
};

export function isSortedFileOutput(output: SortedFileOutput | SortedFolderOutput): output is SortedFileOutput {
    return (output as SortedFileOutput).score !== undefined;
}

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

export function convertToSortedOutput(programOutput: ProgramOutput): SortedFolderOutput {
    return convertToSortedFolder("", "", programOutput);
}

function convertToSortedContainer(path:string, containerOutput: ContainerOutput): SortedContainerOutput {
    return {
        column: containerOutput.column,
        line: containerOutput.line,
        name: containerOutput.name,
        path,
        score: containerOutput.score,
        inner: containerOutput.inner.map(container => convertToSortedContainer(path, container)),
    };
}

function convertToSortedFile(name: string, path: string, fileOutput: FileOutput): SortedFileOutput {
    const inner = [] as SortedContainerOutput[];

    for (const container of fileOutput.inner) {
        inner.push(convertToSortedContainer(path, container));
    }

    return {
        name,
        path: concatFilePath(path, name),
        score: fileOutput.score,
        inner,
    };
}

function convertToSortedFolder(name: string, path: string, folderOutput: FolderOutput): SortedFolderOutput {
    const inner = [] as (SortedFileOutput | SortedFolderOutput)[];

    for (const name in folderOutput) {
        const entry = folderOutput[name];

        if (isFileOutput(entry)) {
            inner.push(convertToSortedFile(name, path, entry));
        } else {
            inner.push(convertToSortedFolder(name, path, entry));
        }
    }

    return {
        name,
        path: concatFilePath(path, name),
        inner,
    };
}

// sort

function sortFileOrContainer(file: SortedFileOutput | SortedContainerOutput) {
    file.inner.sort();

    for (const container of file.inner) {
        sortFileOrContainer(container);
    }
}

function sortProgram(program: SortedProgramOutput, sorter?: Sorter<SortedFileOutput | SortedFolderOutput>) {
    program.inner.sort(sorter);

    for (const fileOrFolder of program.inner) {
        if (isSortedFileOutput(fileOrFolder)) {
            sortFileOrContainer(fileOrFolder);
        } else {
            sortProgram(fileOrFolder);
        }
    }
}

export function sortProgramByComplexity(program: SortedProgramOutput) {
    sortProgram(program, compareSortedOutputs);
}

export function sortProgramInOrder(program: SortedProgramOutput) {
    sortProgram(program);
}
