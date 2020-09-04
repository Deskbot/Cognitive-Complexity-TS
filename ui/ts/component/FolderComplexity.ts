import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { ToggleableBox } from "./generic/ToggleableBox";
import { element } from "../framework";
import { CopyText } from "./generic/CopyText";

export class FolderComplexity {
    private box: ToggleableBox;
    private innerContainers: CognitiveComplexityUi;

    constructor(name: string, complexity: FolderOutput, startOpen: boolean) {
        this.innerContainers = new CognitiveComplexityUi(complexity, false);
        this.box = new ToggleableBox([
            element("p", {},
                name,
                CopyText(name),
            ),
        ],
            startOpen,
        );
        this.box.changeHideableContent([this.innerContainers.dom]);
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
