import { FolderContents } from "./FolderContents";
import { FolderOutput } from "../../../../shared/types";
import { ToggleableBox } from "../box/ToggleableBox";
import { element } from "../../framework";
import { CopyText } from "../controls/CopyText";

export class Folder {
    private box: ToggleableBox;
    private innerContainers: FolderContents;

    constructor(name: string, complexity: FolderOutput, startOpen: boolean) {
        this.innerContainers = new FolderContents(complexity, false);
        this.box = new ToggleableBox([
            element("p", {},
                name,
                CopyText(name),
            ),
        ],
            startOpen,
        );
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
        this.innerContainers.setTreeOpenness(open);
    }

    sortInOrder() {
        this.innerContainers.sortInOrder();
    }
}
