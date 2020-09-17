import { ContainerOutput } from "../../../../shared/types";
import { Controller, element } from "../../framework";
import { iterMap, mapFromArr } from "../../util";
import { SortedMap } from "../../util/SortedMap";
import { CopyText } from "../controls/CopyText";
import { ToggleableBox } from "../box/ToggleableBox";
import { Score } from "../text/Score";
import { Tree } from "../../controller/TreeController";

export class Container implements Tree {
    private box: ToggleableBox;

    private complexityToContainer: SortedMap<ContainerOutput, Container>;

    constructor(
        controller: Controller<Tree>,
        complexity: ContainerOutput,
        filePath: string
    ) {
        this.complexityToContainer = new SortedMap(mapFromArr(
            complexity.inner,
            innerComp => new Container(controller, innerComp, filePath)
        ));

        for (const component of this.complexityToContainer.values()) {
            controller.register(component);
        }

        this.box = new ToggleableBox([
            element("p", {},
                complexity.name,
                CopyText(`${filePath}:${complexity.line}:${complexity.column}`),
            ),
            Score(complexity.score),
        ],
            false,
        );
        this.box.changeHideableContent(() => iterMap(
            this.complexityToContainer.values(),
            container => container.dom
        ));
    }

    get dom(): HTMLElement {
        return this.box.dom;
    }

    private reorderContents() {
        this.box.changeHideableContent(() => {
            return this.complexityToContainer.keys().map(
                complexityOutput => this.complexityToContainer.get(complexityOutput)!.dom
            );
        });
    }

    setTreeOpenness(open: boolean) {
        this.box.setOpenness(open);
    }

    sortByComplexity() {
        this.complexityToContainer.sort((left, right) => {
            return right.score - left.score
        });
        this.reorderContents();
    }

    sortInOrder() {
        this.complexityToContainer.sort();
        this.reorderContents();
    }
}
