import { ContainerOutput } from "../../../shared/types";
import { element } from "../framework";
import { iterMap, mapFromArr } from "../util";
import { SortedMap } from "../util/SortedMap";
import { CopyText } from "./generic/CopyText";
import { ToggleableBox } from "./generic/ToggleableBox";
import { Score } from "./Score";

export class ContainerComplexity {
    private box: ToggleableBox;

    private complexityToContainer: SortedMap<ContainerOutput, ContainerComplexity>;

    constructor(complexity: ContainerOutput, filePath: string) {
        this.complexityToContainer = new SortedMap(mapFromArr(
            complexity.inner,
            innerComp => new ContainerComplexity(innerComp, filePath)
        ));

        this.box = new ToggleableBox([
            element("p", {},
                complexity.name,
                CopyText(`${filePath}:${complexity.line}:${complexity.column}`),
            ),
            Score(complexity.score),
        ],
            false,
        );
        this.box.changeHideableContent(iterMap(
            this.complexityToContainer.values(),
            container => container.dom)
        );
    }

    get dom(): Node {
        return this.box.dom;
    }

    private reorderContents() {
        const newOrder = this.complexityToContainer.keys().map(
            complexityOutput => this.complexityToContainer.get(complexityOutput)!.dom
        );
        this.box.changeHideableContent(newOrder);
    }

    setTreeOpenness(open: boolean) {
        this.box.setOpenness(open);
        for (const container of this.complexityToContainer.values()) {
            container.setTreeOpenness(open);
        }
    }

    sortByComplexity() {
        this.complexityToContainer.sort((left, right) => {
            return right.score - left.score
        });
        this.reorderContents();
        this.sortChildrenByComplexity();
    }

    private sortChildrenByComplexity() {
        for (const container of this.complexityToContainer.values()) {
            container.sortByComplexity();
        }
    }

    private sortChildrenInOrder() {
        for (const container of this.complexityToContainer.values()) {
            container.sortInOrder();
        }
    }

    sortInOrder() {
        this.complexityToContainer.sort();
        this.reorderContents();
        this.sortChildrenInOrder();
    }
}
