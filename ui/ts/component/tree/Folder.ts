import { ToggleableBox } from "../box/ToggleableBox.js";
import { CopyText } from "../controls/CopyText.js";
import { concatFilePath } from "../../domain/path.js";
import { FolderContents } from "./FolderContents.js";
import { showInTree, StickyTitle } from "./StickyTitle.js";
import { SortedFolder } from "../../domain/sortedOutput.js";

export class Folder {
    private box: ToggleableBox;
    private title: StickyTitle;
    private content: FolderContents;
    private depth: number;

    constructor(folder: SortedFolder, children: FolderContents) {
        this.content = children;
        this.depth = folder.depth;

        const fullPath = concatFilePath(folder.path, folder.name);

        this.title = new StickyTitle([
            folder.name,
            CopyText(fullPath),
        ],
            folder.depth
        );

        this.box = new ToggleableBox([
            this.title.dom,
        ],
            false,
            () => this.scrollIntoView(),
        );

        this.box.changeHideableContent(() => [this.content.dom]);
    }

    get dom() {
        return this.box.dom;
    }

    private scrollIntoView() {
        showInTree(this.dom, this.depth);
    }

    setDepth(depth: number) {
        this.title.setDepth(depth);
    }

    setOpenness(open: boolean) {
        this.box.setOpenness(open);
    }
}
