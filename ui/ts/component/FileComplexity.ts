import { FileOutput } from "../../../shared/types";
import { ContainerComplexity } from "./ContainerComplexity";
import { StickyTitle } from "./StickyTitle";
import { ToggleableBox } from "./generic/ToggleableBox";
import { Score } from "./Score";
import { CopyText } from "./generic/CopyText";

export class FileComplexity {
    readonly dom: Node;
    private box: ToggleableBox;
    private innerContainers: ContainerComplexity[];

    constructor(filePath: string, complexity: FileOutput, startOpen: boolean) {
        this.innerContainers = complexity.inner.map(complexity => new ContainerComplexity(complexity, filePath));

        this.box = new ToggleableBox([
            StickyTitle([
                filePath,
                CopyText(filePath),
            ]),
            Score(complexity.score),
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
