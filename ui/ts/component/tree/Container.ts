import { ContainerOutput } from "../../../../shared/types.js";
import { element } from "../../framework.js";
import { CopyText } from "../controls/CopyText.js";
import { ToggleableBox } from "../box/ToggleableBox.js";
import { Score } from "../text/Score.js";

export class Container {
    private box: ToggleableBox;
    private children: Container[]; // TODO allow this to change

    constructor(
        complexity: ContainerOutput,
        filePath: string,
        children: Container[],
    ) {
        this.children = children;

        this.box = new ToggleableBox([
            element("p", {},
                complexity.name,
                CopyText(`${filePath}:${complexity.line}:${complexity.column}`),
            ),
            Score(complexity.score),
        ],
            false,
        );

        this.box.changeHideableContent(() => this.children.map(child => child.dom));
    }

    get dom(): HTMLElement {
        return this.box.dom;
    }

    setChildren(children: Container[]) {
        this.children = children;
        this.box.changeHideableContent(() => this.children.map(child => child.dom));
    }

    setOpenness(open: boolean) {
        this.box.setOpenness(open);
    }
}
