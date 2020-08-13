import { FileOutput, FolderOutput } from "../../../shared/types";
import { FileComplexity } from "./FileComplexity";
import { FolderComplexity } from "./FolderComplexity";

export function FileOrFolderComplexity(
    path: string,
    complexity: FileOutput | FolderOutput,
    startOpen: boolean
): Node {
    if (isFileOutput(complexity)) {
        return FileComplexity(path, complexity, startOpen);
    } else {
        return FolderComplexity(path, complexity, startOpen);
    }
}

function isFileOutput(output: FileOutput | FolderOutput): output is FileOutput {
    return "score" in output;
}
