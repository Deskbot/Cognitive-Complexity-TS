import { ContainerOutput, FileOutput } from "../../../shared/types";
import { ContainerComplexity } from "./ContainerComplexity";
import { StickyTitle } from "./StickyTitle";
import { ToggleableBox } from "./generic/ToggleableBox";
import { Score } from "./Score";
import { CopyText } from "./generic/CopyText";
import { iterMap, mapFromArr } from "../util";
import { SortedMap } from "../util/SortedMap";

export class FileComplexity {
    private box: ToggleableBox;

    private complexityToContainer: SortedMap<ContainerOutput, ContainerComplexity>;

    constructor(filePath: string, complexity: FileOutput, startOpen: boolean) {
        this.complexityToContainer = new SortedMap(mapFromArr(
            complexity.inner,
            complexity => new ContainerComplexity(complexity, filePath)
        ));

        this.box = new ToggleableBox([
            StickyTitle([
                filePath,
                CopyText(filePath),
            ]),
            Score(complexity.score),
        ],
            iterMap(this.complexityToContainer.values(), container => container.dom),
            startOpen,
        );
    }

    get dom(): Node {
        return this.box.dom;
    }

    private reorderContents() {
        const newOrder = this.complexityToContainer.keys().map((complexity) => {
            return this.complexityToContainer.get(complexity)!.dom;
        });

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
        this.complexityToContainer.sort((left, right) => {
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
