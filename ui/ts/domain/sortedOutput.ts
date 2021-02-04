import { FunctionNodeInfo } from "../../../shared/types";
import { SortedMap } from "../util/SortedMap";

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
