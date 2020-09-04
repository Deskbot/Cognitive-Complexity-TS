import { ContainerOutput, FileOutput } from "../../../shared/types";
import { ContainerComplexity } from "./ContainerComplexity";
import { StickyTitle } from "./StickyTitle";
import { ToggleableBox } from "./generic/ToggleableBox";
import { Score } from "./Score";
import { CopyText } from "./generic/CopyText";
import { map } from "../util";

export class FileComplexity {
    private box: ToggleableBox;

    private complexityToComponent: Map<ContainerOutput, ContainerComplexity>;
    private orderedInnerComplexity: ContainerOutput[];

    constructor(filePath: string, complexity: FileOutput, startOpen: boolean) {
        this.orderedInnerComplexity = [...complexity.inner];

        this.complexityToComponent = map(
            this.orderedInnerComplexity,
            complexity => new ContainerComplexity(complexity, filePath)
        );

        this.box = new ToggleableBox([
            StickyTitle([
                filePath,
                CopyText(filePath),
            ]),
            Score(complexity.score),
        ],
            [...this.complexityToComponent.values()]
                .map(container => container.dom),
            startOpen,
        );
    }

    get dom(): Node {
        return this.box.dom;
    }

    private reorderContents() {
        const newOrder = this.orderedInnerComplexity.map((complexity) => {
            return this.complexityToComponent.get(complexity)!.dom;
        });

        this.box.changeHideableContent(newOrder);
    }

    setTreeOpenness(open: boolean) {
        this.box.setOpenness(open);
        for (const container of this.complexityToComponent.values()) {
            container.setTreeOpenness(open);
        }
    }

    sortByComplexity() {
        this.orderedInnerComplexity.sort((left, right) => {
            return right.score - left.score
        });
        this.reorderContents();
        this.sortChildrenByComplexity();
    }

    private sortChildrenByComplexity() {
        for (const container of this.complexityToComponent.values()) {
            container.sortByComplexity();
        }
    }

    private sortChildrenInOrder() {
        for (const container of this.complexityToComponent.values()) {
            container.sortInOrder();
        }
    }

    sortInOrder() {
        this.orderedInnerComplexity.sort((left, right) => {
            // smaller line first
            const lineDiff = left.line - right.line;
            if (lineDiff !== 0) {
                return lineDiff;
            }

            // if the line numbers are the same, sort by column
            return left.column - right.column;
        });
        this.reorderContents();
        this.sortChildrenInOrder();
    }
}
