import { FileOutput, FolderOutput } from "../../../shared/types";
import { FileComplexity } from "./FileComplexity";
import { FolderComplexity } from "./FolderComplexity";

export function FileOrFolderComplexity(
    path: string,
    complexity: FileOutput | FolderOutput,
    startOpen: boolean
): FileComplexity | FolderComplexity {
    if (isFileOutput(complexity)) {
        return new FileComplexity(path, complexity, startOpen);
    } else {
        return new FolderComplexity(path, complexity, startOpen);
    }
}

function isFileOutput(output: FileOutput | FolderOutput): output is FileOutput {
    return "score" in output;
}
