import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { ToggleableBox } from "./generic/ToggleableBox";
import { element } from "../framework";
import { CopyText } from "./generic/CopyText";
import { FileComplexity } from "./FileComplexity";

export class FolderComplexity {
    readonly dom: Node;
    private box: ToggleableBox;
    private innerContainers: (FileComplexity | FolderComplexity)[];

    constructor(name: string, complexity: FolderOutput, startOpen: boolean) {
        this.innerContainers = CognitiveComplexityUi(complexity, false);
        this.box = new ToggleableBox([
            element("p", {},
                name,
                CopyText(name),
            ),
        ],
            this.innerContainers.map(container => container.dom),
            startOpen,
        );
        this.dom = this.box.dom;
    }

    setTreeOpenness(open: boolean) {
        this.box.setOpenness(open);
        this.innerContainers.forEach((container) => {
            container.setTreeOpenness(open);
        });
    }
}
