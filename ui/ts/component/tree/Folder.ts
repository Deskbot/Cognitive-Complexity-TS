import { FolderContents } from "./FolderContents";
import { FolderOutput } from "../../../../shared/types";
import { ToggleableBox } from "../box/ToggleableBox";
import { Controller, element } from "../../framework";
import { CopyText } from "../controls/CopyText";
import { Tree } from "../../controller/TreeController";

export class Folder implements Tree {
    private box: ToggleableBox;
    private innerContainers: FolderContents;

    constructor(
        controller: Controller<Tree>,
        name: string,
        complexity: FolderOutput,
        startOpen: boolean
    ) {
        this.box = new ToggleableBox([
            element("p", {},
            name,
            CopyText(name),
            ),
        ],
            startOpen,
        );

        this.innerContainers = new FolderContents(controller, complexity, false);

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
