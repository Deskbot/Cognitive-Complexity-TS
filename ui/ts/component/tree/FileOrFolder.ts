import { FileOutput, FolderOutput } from "../../../../shared/types.js";
import { Tree } from "../../controller/TreeController.js";
import { isFileOutput } from "../../domain/output.js";
import { Controller } from "../../framework.js";
import { File } from "./File.js";
import { Folder } from "./Folder.js";

export function FileOrFolder(
    controller: Controller<Tree>,
    path: string,
    name: string,
    complexity: FileOutput | FolderOutput,
    startOpen: boolean
): File | Folder {
    if (isFileOutput(complexity)) {
        return new File(controller, path, name, complexity, startOpen);
    } else {
        return new Folder(controller, path, name, complexity, startOpen);
    }
}
