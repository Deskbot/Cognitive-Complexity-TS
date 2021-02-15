import { ToggleableBox } from "../box/ToggleableBox.js";
import { CopyText } from "../controls/CopyText.js";
import { concatFilePath } from "../../domain/path.js";
import { FolderContents } from "./FolderContents.js";
import { StickyTitle } from "../text/StickyTitle.js";
import { SortedFolder } from "../../domain/sortedOutput.js";

export class Folder {
    private box: ToggleableBox;
    private title: StickyTitle;
    private content: FolderContents;

    constructor(folder: SortedFolder, children: FolderContents) {
        this.content = children;

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
            () => {
                // if off the screen, put it on screen.
                const rect = this.dom.getBoundingClientRect();
                if (rect.top < 0) {
                    this.dom.scrollIntoView(true);
                }
            }
        );

        this.box.changeHideableContent(() => [this.content.dom]);
    }

    get dom() {
        return this.box.dom;
    }

    setDepth(depth: number) {
        this.title.setDepth(depth);
    }

    setOpenness(open: boolean) {
        this.box.setOpenness(open);
    }
}
