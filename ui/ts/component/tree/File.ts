import { Container } from "./Container.js";
import { StickyTitle } from "./StickyTitle.js";
import { ToggleableBox } from "../box/ToggleableBox.js";
import { Score } from "../text/Score.js";
import { CopyText } from "../controls/CopyText.js";
import { concatFilePath } from "../../domain/path.js";
import { SortedFile } from "../../domain/sortedOutput.js";
import { showInTree } from "./showInTree.js";

export class File {
    private box: ToggleableBox;
    private title: StickyTitle;
    private children: Container[];
    private depth: number;

    constructor(file: SortedFile, children: Container[]) {
        this.children = children;
        this.depth = file.depth;

        const fullPath = concatFilePath(file.path, file.name);

        this.title = new StickyTitle([
            file.name,
            CopyText(fullPath),
        ],
            file.depth
        );

        this.box = new ToggleableBox([
            this.title.dom,
            Score(file.score),
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
        this.depth = depth;
        this.title.setDepth(depth);
    }

    setOpenness(open: boolean) {
        this.box.setOpenness(open);
    }
}
