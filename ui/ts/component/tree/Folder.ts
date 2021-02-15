import { ToggleableBox } from "../box/ToggleableBox.js";
import { CopyText } from "../controls/CopyText.js";
import { concatFilePath } from "../../domain/path.js";
import { FolderContents } from "./FolderContents.js";
import { StickyTitle } from "./StickyTitle.js";
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
                const depth = folder.depth;
                const targetTopPos = 39 * (depth - 1);

                // if top of elem is above the target position, scroll it down.
                const rect = this.dom.getBoundingClientRect();
                if (rect.top < targetTopPos) {

                    // put the top of the element at the top of the screen
                    this.dom.scrollIntoView(true);

                    // scroll the window down to put the element at its target position
                    window.scrollBy(0, -39 * (depth - 1));
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
