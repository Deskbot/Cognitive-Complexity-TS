import { FileOutput, FolderOutput } from "../../../../shared/types";
import { File } from "./File";
import { Folder } from "./Folder";

export function FileOrFolder(
    path: string,
    complexity: FileOutput | FolderOutput,
    startOpen: boolean
): File | Folder {
    if (isFileOutput(complexity)) {
        return new File(path, complexity, startOpen);
    } else {
        return new Folder(path, complexity, startOpen);
    }
}

function isFileOutput(output: FileOutput | FolderOutput): output is FileOutput {
    return "score" in output;
}
