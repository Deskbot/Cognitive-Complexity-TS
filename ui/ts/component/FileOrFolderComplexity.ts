import { FileOutput, FolderOutput } from "../../../shared/types";
import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FileComplexity } from "./FileComplexity";

export function FileOrFolderComplexity(path: string, complexity: FileOutput | FolderOutput): Node {
    if (isFileOutput(complexity)) {
        return FileComplexity(path, complexity);
    } else {
        return CognitiveComplexityUi(complexity);
    }
}

function isFileOutput(output: FileOutput | FolderOutput): output is FileOutput {
    return "score" in output;
}
