import { ContainerOutput } from "../../../shared/types";
import { element } from "../framework";
import { map } from "../util";
import { CopyText } from "./generic/CopyText";
import { ToggleableBox } from "./generic/ToggleableBox";
import { Score } from "./Score";

export class ContainerComplexity {
    readonly dom: Node;

    private box: ToggleableBox;
    private innerContainers: ContainerComplexity[];

    private innerContainerComp: ContainerOutput[];
    private compToContainer: Map<ContainerOutput, ContainerComplexity>;

    constructor(complexity: ContainerOutput, filePath: string) {
        this.innerContainerComp = [...complexity.inner];
        this.compToContainer = map(
            this.innerContainerComp,
            innerComp => new ContainerComplexity(innerComp, filePath)
        );
        this.innerContainers = Object.values(this.compToContainer);

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

    private reorderContents() {
        const newOrder = this.innerContainerComp.map(
            complexityOutput => this.compToContainer.get(complexityOutput)!.dom
        );
        this.box.changeHideableContent(newOrder);
    }

    setTreeOpenness(open: boolean) {
        this.box.setOpenness(open);
        this.innerContainers.forEach((container) => {
            container.setTreeOpenness(open);
        });
    }

    sortByComplexity() {
        this.innerContainerComp.sort((left, right) => {
            return right.score - left.score
        });
        this.reorderContents();
        this.sortChildrenByComplexity();
    }

    private sortChildrenByComplexity() {
        this.innerContainers.forEach((innerContainer) => {
            innerContainer.sortByComplexity();
        });
    }

    private sortChildrenInOrder() {
        this.innerContainers.forEach((innerContainer) => {
            innerContainer.sortInOrder();
        });
    }

    sortInOrder() {
        this.innerContainerComp.sort();
        this.reorderContents();
        this.sortChildrenInOrder();
    }
}
