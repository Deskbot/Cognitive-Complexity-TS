import { CopyText } from "../controls/CopyText.js";
import { ToggleableBox } from "../box/ToggleableBox.js";
import { Score } from "../text/Score.js";
import { StickyTitle } from "../text/StickyTitle.js";
import { SortedContainer } from "../../domain/sortedOutput.js";

export class Container {
    private box: ToggleableBox;
    private children: Container[];

    constructor(
        complexity: SortedContainer,
        children: Container[],
    ) {
        this.children = children;

        this.box = new ToggleableBox([
            StickyTitle([
                complexity.name,
                CopyText(`${complexity.path}:${complexity.line}:${complexity.column}`),
            ],
                complexity.depth
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
