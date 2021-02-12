import { ContainerOutput, FileOutput, FolderOutput, FunctionNodeInfo, ProgramOutput } from "../../../shared/types.js";
import { Sorter } from "../util/util.js";
import { isFileOutput } from "./output.js";
import { concatFilePath } from "./path.js";

// type

interface Unique {
    id: number;
}

let nextId = Number.MIN_SAFE_INTEGER;

export interface SortedContainer extends FunctionNodeInfo, Unique {
    name: string;
    path: string;
    score: number;
    inner: SortedContainer[];
}

export interface SortedFile extends Unique {
    name: string;
    path: string;
    score: number;
    inner: SortedContainer[];
}

export type SortedProgram = SortedFolder;

export interface SortedFolder extends Unique {
    name: string;
    path: string;
    inner: SortedAnything[];
};

export type SortedAnything = SortedFolder | SortedFile | SortedContainer;

export function isSortedFileOutput(output: SortedAnything): output is SortedFile {
    return (output as SortedFile).score !== undefined && (output as SortedContainer).line === undefined;
}

export function isSortedFolderOutput(output: SortedAnything): output is SortedFolder {
    return (output as SortedFile | SortedContainer).score === undefined;
}

export function isSortedContainerOutput(output: SortedAnything): output is SortedContainer {
    return (output as SortedContainer).line !== undefined;
}

// clone

export function cloneSortedOutput(output: SortedProgram): SortedProgram {
    return JSON.parse(JSON.stringify(output));
}

// compare

function compareOutputsByName(left: SortedAnything, right: SortedAnything): number {
    const leftName = left.name.toLowerCase();
    const rightName = right.name.toLowerCase();

    return leftName < rightName
        ? -1
        : leftName > rightName
            ? 1
            : 0;
}

function compareSortedOutputComplexity(left: SortedAnything, right: SortedAnything,): number {
    const leftHasScore = !isSortedFolderOutput(left);
    const rightHasScore = !isSortedFolderOutput(right);

    if (leftHasScore && rightHasScore) {
        // If the typeof statements were directly in the if condition,
        // the casting would not be required by TypeScript.
        const leftScore = (left as SortedFile).score;
        const rightScore = (right as SortedFile).score;

        return rightScore - leftScore;
    }

    if (!leftHasScore && !rightHasScore) {
        return 0;
    }

    // folders should be at the bottom of the complexity list

    if (!leftHasScore) {
        return 1; // left is "bigger"
    }

    if (!rightHasScore) {
        return -1; // left is "smaller"
    }

    return 0; // unreachable
}

function compareSortedOutputOrder(left: SortedContainer, right: SortedContainer): number;
function compareSortedOutputOrder(left: SortedFile | SortedFolder, right: SortedFile | SortedFolder): number;
function compareSortedOutputOrder(left: SortedAnything, right: SortedAnything): number {
    const leftIsContainer = isSortedContainerOutput(left);
    const rightIsContainer = isSortedContainerOutput(right);

    if (leftIsContainer && rightIsContainer) {
        const leftContainer = left as SortedContainer;
        const rightContainer = right as SortedContainer;

        // assume same file
        // smaller line numbers first
        const lineDiff = leftContainer.line - rightContainer.line;
        if (lineDiff !== 0) return lineDiff;

        // tie-breaker: smaller column numbers first
        return leftContainer.column - rightContainer.column;
    }

    return compareOutputsByName(left, right);
}

// convert

export function convertToSortedOutput(programOutput: ProgramOutput): SortedFolder {
    return convertToSortedFolder("", "", programOutput);
}

function convertToSortedContainer(path: string, containerOutput: ContainerOutput): SortedContainer {
    return {
        id: nextId++,
        column: containerOutput.column,
        line: containerOutput.line,
        name: containerOutput.name,
        path,
        score: containerOutput.score,
        inner: containerOutput.inner.map(container => convertToSortedContainer(path, container)),
    };
}

function convertToSortedFile(path: string, name: string, fileOutput: FileOutput): SortedFile {
    const inner = [] as SortedContainer[];

    const innerPath = concatFilePath(path, name);

    for (const container of fileOutput.inner) {
        inner.push(convertToSortedContainer(innerPath, container));
    }

    return {
        id: nextId++,
        name,
        path,
        score: fileOutput.score,
        inner,
    };
}

function convertToSortedFolder(path: string, name: string, folderOutput: FolderOutput): SortedFolder {
    const inner = [] as (SortedFile | SortedFolder)[];

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
        id: nextId++,
        name,
        path,
        inner,
    };
}

// sort

function sortFileOrContainer(file: SortedFile | SortedContainer, sorter?: Sorter<SortedFile | SortedFolder>) {
    file.inner.sort(sorter);

    for (const container of file.inner) {
        sortFileOrContainer(container);
    }
}

function sortProgram(program: SortedProgram, sorter?: Sorter<SortedFile | SortedFolder>) {
    program.inner.sort(sorter);

    for (const fileOrFolder of program.inner) {
        if (isSortedFileOutput(fileOrFolder)) {
            sortFileOrContainer(fileOrFolder, sorter);
        } else {
            sortProgram(fileOrFolder, sorter);
        }
    }
}

export function sortProgramByComplexity(program: SortedProgram) {
    sortProgram(program, compareSortedOutputComplexity);
}

export function sortProgramByName(program: SortedProgram) {
    sortProgram(program, compareOutputsByName);
}

export function sortProgramInOrder(program: SortedProgram) {
    sortProgram(program, compareSortedOutputOrder);
}
