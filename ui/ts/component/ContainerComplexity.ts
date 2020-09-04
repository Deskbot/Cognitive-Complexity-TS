import { ContainerOutput } from "../../../shared/types";
import { element } from "../framework";
import { map } from "../util";
import { CopyText } from "./generic/CopyText";
import { ToggleableBox } from "./generic/ToggleableBox";
import { Score } from "./Score";

export class ContainerComplexity {
    private box: ToggleableBox;

    private sortedInnerComp: ContainerOutput[];
    private compToContainer: Map<ContainerOutput, ContainerComplexity>;

    constructor(complexity: ContainerOutput, filePath: string) {
        this.sortedInnerComp = [...complexity.inner];

        this.compToContainer = map(
            this.sortedInnerComp,
            innerComp => new ContainerComplexity(innerComp, filePath)
        );

        this.box = new ToggleableBox([
            element("p", {},
                complexity.name,
                CopyText(`${filePath}:${complexity.line}:${complexity.column}`),
            ),
            Score(complexity.score),
        ],
            [...this.compToContainer.values()].map(container => container.dom),
            false,
        );
    }

    get dom(): Node {
        return this.box.dom;
    }

    private reorderContents() {
        const newOrder = this.sortedInnerComp.map(
            complexityOutput => this.compToContainer.get(complexityOutput)!.dom
        );
        this.box.changeHideableContent(newOrder);
    }

    setTreeOpenness(open: boolean) {
        this.box.setOpenness(open);
        for (const container of this.compToContainer.values()) {
            container.setTreeOpenness(open);
        }
    }

    sortByComplexity() {
        this.sortedInnerComp.sort((left, right) => {
            return right.score - left.score
        });
        this.reorderContents();
        this.sortChildrenByComplexity();
    }

    private sortChildrenByComplexity() {
        for (const container of this.compToContainer.values()) {
            container.sortByComplexity();
        }
    }

    private sortChildrenInOrder() {
        for (const container of this.compToContainer.values()) {
            container.sortInOrder();
        }
    }

    sortInOrder() {
        this.sortedInnerComp.sort();
        this.reorderContents();
        this.sortChildrenInOrder();
    }
}
