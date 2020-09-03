import { ContainerOutput, FileOutput } from "../../../shared/types";
import { ContainerComplexity } from "./ContainerComplexity";
import { StickyTitle } from "./StickyTitle";
import { ToggleableBox } from "./generic/ToggleableBox";
import { Score } from "./Score";
import { CopyText } from "./generic/CopyText";
import { map } from "../util";

export class FileComplexity {
    readonly dom: Element;

    private box: ToggleableBox;
    private innerContainers: ContainerComplexity[];

    private complexityToComponent: Map<ContainerOutput, ContainerComplexity>;
    private complexity: FileOutput;
    private innerComplexity: ContainerOutput[];

    constructor(filePath: string, complexity: FileOutput, startOpen: boolean) {
        this.complexity = complexity;
        this.innerComplexity = [...this.complexity.inner];

        this.complexityToComponent = map(
            complexity.inner,
            complexity => new ContainerComplexity(complexity, filePath)
        );

        this.innerContainers = [...this.complexityToComponent.values()];


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

    private reorderContents() {
        const newOrder = this.innerComplexity.map((complexity) => {
            return this.complexityToComponent.get(complexity)!.dom;
        });

        this.box.changeHideableContent(newOrder);
    }

    setTreeOpenness(open: boolean) {
        this.box.setOpenness(open);
        this.innerContainers.forEach((container) => {
            container.setTreeOpenness(open);
        });
    }

    sortByComplexity() {
        this.innerComplexity.sort((left, right) => {
            return right.score - left.score
        });
        this.reorderContents();
        this.sortChildrenByComplexity();
    }

    private sortChildrenByComplexity() {
        this.innerContainers.forEach((container) => {
            container.sortByComplexity();
        })
    }
}
