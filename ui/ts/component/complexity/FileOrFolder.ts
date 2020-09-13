import { FileOutput, FolderOutput } from "../../../../shared/types";
import { TreeController } from "../../controller/TreeController";
import { File } from "./File";
import { Folder } from "./Folder";

export function FileOrFolder(
    controller: TreeController,
    path: string,
    complexity: FileOutput | FolderOutput,
    startOpen: boolean
): File | Folder {
    if (isFileOutput(complexity)) {
        return new File(controller, path, complexity, startOpen);
    } else {
        return new Folder(controller, path, complexity, startOpen);
    }
}

function isFileOutput(output: FileOutput | FolderOutput): output is FileOutput {
    return "score" in output;
}
