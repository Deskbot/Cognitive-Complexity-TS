import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { ToggleableBox } from "./generic/ToggleableBox";
import { element } from "../framework";
import { CopyText } from "./generic/CopyText";

export class FolderComplexity {
    readonly dom: Element;
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
            [this.innerContainers.dom],
            startOpen,
        );
        this.dom = this.box.dom;
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
