import { Container } from "./Container.js";
import { StickyTitle } from "../text/StickyTitle.js";
import { ToggleableBox } from "../box/ToggleableBox.js";
import { Score } from "../text/Score.js";
import { CopyText } from "../controls/CopyText.js";
import { concatFilePath } from "../../domain/path.js";
import { SortedFile } from "../../domain/sortedOutput.js";

export class File {
    private box: ToggleableBox;
    private title: StickyTitle;
    private children: Container[];

    constructor(
        file: SortedFile,
        children: Container[],
    ) {
        this.children = children;

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
        );

        this.box.changeHideableContent(() => this.children.map(child => child.dom));
    }

    get dom(): Node {
        return this.box.dom;
    }

    setChildren(children: Container[]) {
        this.children = children;
        this.box.changeHideableContent(() => this.children.map(child => child.dom));
    }

    setDepth(depth: number) {
        this.title.setDepth(depth);
    }

    setOpenness(open: boolean) {
        this.box.setOpenness(open);
    }
}
