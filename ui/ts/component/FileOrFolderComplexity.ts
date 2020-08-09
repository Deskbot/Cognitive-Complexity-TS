import { FileOutput, FolderOutput } from "../../../shared/types";
import { FileComplexity } from "./FileComplexity";
import { FolderComplexity } from "./FolderComplexity";

export function FileOrFolderComplexity(path: string, complexity: FileOutput | FolderOutput): Node {
    if (isFileOutput(complexity)) {
        return FileComplexity(path, complexity);
    } else {
        return new FolderComplexity(path, complexity).dom;
    }
}

function isFileOutput(output: FileOutput | FolderOutput): output is FileOutput {
    return "score" in output;
}
