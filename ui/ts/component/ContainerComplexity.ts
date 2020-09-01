import { ContainerOutput } from "../../../shared/types";
import { element } from "../framework";
import { CopyText } from "./generic/CopyText";
import { ToggleableBox } from "./generic/ToggleableBox";
import { Score } from "./Score";

export class ContainerComplexity {
    readonly dom: Node;

    private box: ToggleableBox;
    private innerContainers: ContainerComplexity[];

    constructor(complexity: ContainerOutput, filePath: string) {
        this.innerContainers = complexity.inner.map(complexity => new ContainerComplexity(complexity, filePath));

        this.box = new ToggleableBox([
            element("p", {},
                complexity.name,
                CopyText(`${filePath}:${complexity.line}:${complexity.column}`),
            ),
            Score(complexity.score),
        ],
            this.innerContainers.map(container => container.dom),
            false,
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
