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

function isSortedContainerOutput(output: SortedFileOutput | SortedFolderOutput | SortedContainerOutput): output is SortedContainerOutput {
    return (output as SortedContainerOutput).line !== undefined;
}

// clone

export function cloneSortedOutput(output: SortedProgramOutput): SortedProgramOutput {
    return JSON.parse(JSON.stringify(output));
}

// compare

function compareSortedOutputComplexity(
    left: SortedFileOutput | SortedFolderOutput,
    right: SortedFileOutput | SortedFolderOutput,
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
        return 1; // left is "bigger"
    }

    if (!rightIsFile) {
        return -1; // left is "smaller"
    }

    return 0; // unreachable
}

function compareSortedOutputOrder(left: SortedContainerOutput, right: SortedContainerOutput): number;
function compareSortedOutputOrder(left: SortedFileOutput | SortedFolderOutput, right: SortedFileOutput | SortedFolderOutput): number;
function compareSortedOutputOrder(
    left: SortedContainerOutput | SortedFileOutput | SortedFolderOutput,
    right: SortedContainerOutput | SortedFileOutput | SortedFolderOutput
): number {
    const leftIsContainer = isSortedContainerOutput(left);
    const rightIsContainer = isSortedContainerOutput(right);

    if (leftIsContainer && rightIsContainer) {
        const leftContainer = left as SortedContainerOutput;
        const rightContainer = right as SortedContainerOutput;

        // smaller line numbers first
        const lineDiff = leftContainer.line - rightContainer.line;
        if (lineDiff !== 0) return lineDiff;

        // tie-breaker: smaller column numbers first
        return leftContainer.column - rightContainer.column;
    }

    return left.name < right.name
        ? -1
        : left.name > right.name
            ? 1
            : 0;
}

// convert

export function convertToSortedOutput(programOutput: ProgramOutput): SortedFolderOutput {
    return convertToSortedFolder("", "", programOutput);
}

function convertToSortedContainer(path: string, containerOutput: ContainerOutput): SortedContainerOutput {
    return {
        column: containerOutput.column,
        line: containerOutput.line,
        name: containerOutput.name,
        path,
        score: containerOutput.score,
        inner: containerOutput.inner.map(container => convertToSortedContainer(path, container)),
    };
}

function convertToSortedFile(path: string, name: string, fileOutput: FileOutput): SortedFileOutput {
    const inner = [] as SortedContainerOutput[];

    const innerPath = concatFilePath(path, name);

    for (const container of fileOutput.inner) {
        inner.push(convertToSortedContainer(innerPath, container));
    }

    return {
        name,
        path,
        score: fileOutput.score,
        inner,
    };
}

function convertToSortedFolder(path: string, name: string, folderOutput: FolderOutput): SortedFolderOutput {
    const inner = [] as (SortedFileOutput | SortedFolderOutput)[];

    const innerPath = concatFilePath(path, name);

    for (const name in folderOutput) {
        const entry = folderOutput[name];

        if (isFileOutput(entry)) {
            inner.push(convertToSortedFile(innerPath, name, entry));
        } else {
            inner.push(convertToSortedFolder(innerPath, name, entry));
        }
    }

    return {
        name,
        path,
        inner,
    };
}

// sort

function sortFileOrContainer(file: SortedFileOutput | SortedContainerOutput, sorter?: Sorter<SortedFileOutput | SortedFolderOutput>) {
    file.inner.sort(sorter);

    for (const container of file.inner) {
        sortFileOrContainer(container);
    }
}

function sortProgram(program: SortedProgramOutput, sorter?: Sorter<SortedFileOutput | SortedFolderOutput>) {
    program.inner.sort(sorter);

    for (const fileOrFolder of program.inner) {
        if (isSortedFileOutput(fileOrFolder)) {
            sortFileOrContainer(fileOrFolder, sorter);
        } else {
            sortProgram(fileOrFolder, sorter);
        }
    }
}

export function sortProgramByComplexity(program: SortedProgramOutput) {
    sortProgram(program, compareSortedOutputComplexity);
}

export function sortProgramInOrder(program: SortedProgramOutput) {
    sortProgram(program, compareSortedOutputOrder);
}
