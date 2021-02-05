import { FolderOutput, FunctionNodeInfo, ProgramOutput } from "../../../shared/types.js";
import { SortedMap } from "../util/SortedMap.js";
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

export function convertToSortedOutput(programOutput: ProgramOutput): SortedProgramOutput {
    return convertToSortedFolderOutput(programOutput);
}

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
