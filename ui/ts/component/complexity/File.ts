import { ContainerOutput, FileOutput } from "../../../../shared/types";
import { Container } from "./Container";
import { StickyTitle } from "../text/StickyTitle";
import { ToggleableBox } from "../box/ToggleableBox";
import { Score } from "../text/Score";
import { CopyText } from "../controls/CopyText";
import { iterMap, mapFromArr } from "../../util";
import { SortedMap } from "../../util/SortedMap";

export class File {
    private box: ToggleableBox;
    private complexityToContainer: SortedMap<ContainerOutput, Container>;

    constructor(filePath: string, complexity: FileOutput, startOpen: boolean) {
        this.complexityToContainer = new SortedMap(mapFromArr(
            complexity.inner,
            complexity => new Container(complexity, filePath)
        ));

        this.box = new ToggleableBox([
            StickyTitle([
                filePath,
                CopyText(filePath),
            ]),
            Score(complexity.score),
        ],
            startOpen,
        );
        this.box.changeHideableContent(
            () => iterMap(this.complexityToContainer.values(), container => container.dom)
        );
    }

    get dom(): Node {
        return this.box.dom;
    }

    private reorderContents() {
        this.box.changeHideableContent(() => {
            return this.complexityToContainer.keys()
                .map((complexity) => {
                    return this.complexityToContainer.get(complexity)!.dom;
                });
        });
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
