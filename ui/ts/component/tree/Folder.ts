import { FolderContents } from "./FolderContents.js";
import { FolderOutput } from "../../../../shared/types.js";
import { ToggleableBox } from "../box/ToggleableBox.js";
import { Controller, element } from "../../framework.js";
import { CopyText } from "../controls/CopyText.js";
import { Tree } from "../../controller/TreeController.js";
import { concatFilePath } from "../../domain/path.js";

export class Folder implements Tree {
    private box: ToggleableBox;
    private innerContainers: FolderContents;

    constructor(
        controller: Controller<Tree>,
        path: string,
        name: string,
        complexity: FolderOutput,
        startOpen: boolean
    ) {
        const fullPath = concatFilePath(path, name);

        this.box = new ToggleableBox([
            element("p", {},
                name,
                CopyText(fullPath),
            ),
        ],
            startOpen,
        );

        this.innerContainers = new FolderContents(controller, complexity, fullPath, false);
        this.box.changeHideableContent(() => [this.innerContainers.dom]);
    }

    get dom(): Node {
        return this.box.dom;
    }

    sortByComplexity() {
        this.innerContainers.sortByComplexity();
    }

    setTreeOpenness(open: boolean) {
        this.box.setOpenness(open);
    }

    sortInOrder() {
        this.innerContainers.sortInOrder();
    }
}
