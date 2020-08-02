import { FileOutput, FolderOutput } from "../../../shared/types";
import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FileComplexity } from "./FileComplexity";

export function FileOrFolderComplexity(complexity: FileOutput | FolderOutput): Node {
    console.log(complexity)
    if (isFileOutput(complexity)) {
        return FileComplexity(complexity);
    } else {
        return CognitiveComplexityUi(complexity);
    }
}

function isFileOutput(output: FileOutput | FolderOutput): output is FileOutput {
    return "score" in output;
}
