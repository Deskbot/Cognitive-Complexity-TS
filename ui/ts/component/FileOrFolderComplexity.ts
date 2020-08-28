import { FileOutput, FolderOutput } from "../../../shared/types";
import { FileComplexity } from "./FileComplexity";
import { FolderComplexity } from "./FolderComplexity";
import { ToggleableBox } from "./generic/ToggleableBox";

export function FileOrFolderComplexity(
    path: string,
    complexity: FileOutput | FolderOutput,
    startOpen: boolean
): ToggleableBox {
    if (isFileOutput(complexity)) {
        return FileComplexity(path, complexity, startOpen);
    } else {
        return FolderComplexity(path, complexity, startOpen);
    }
}

function isFileOutput(output: FileOutput | FolderOutput): output is FileOutput {
    return "score" in output;
}
