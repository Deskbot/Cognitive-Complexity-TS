import { CopyText } from "../controls/CopyText.js";
import { ToggleableBox } from "../box/ToggleableBox.js";
import { Score } from "../text/Score.js";
import { showInTree, StickyTitle } from "./StickyTitle.js";
import { SortedContainer } from "../../domain/sortedOutput.js";

export class Container {
    private box: ToggleableBox;
    private title: StickyTitle;
    private children: Container[];
    private depth: number;

    constructor(complexity: SortedContainer, children: Container[]) {
        this.children = children;
        this.depth = complexity.depth;

        this.title = new StickyTitle([
            complexity.name,
            CopyText(`${complexity.path}:${complexity.line}:${complexity.column}`),
        ],
            complexity.depth
        );

        this.box = new ToggleableBox([
            this.title.dom,
            Score(complexity.score),
        ],
            false,
            () => this.scrollIntoView(),
        );

        this.box.changeHideableContent(() => this.children.map(child => child.dom));
    }

    get dom() {
        return this.box.dom;
    }

    private scrollIntoView() {
        showInTree(this.dom, this.depth);
    }

    setChildren(children: Container[]) {
        this.children = children;
        this.box.changeHideableContent(() => this.children.map(child => child.dom));
    }

    setDepth(depth: number) {
        if (this.depth !== depth) {
            this.depth = depth;
            this.title.setDepth(depth);
        }
    }

    setOpenness(open: boolean) {
        this.box.setOpenness(open);
    }
}
