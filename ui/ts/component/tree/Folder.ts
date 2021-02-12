import { ToggleableBox } from "../box/ToggleableBox.js";
import { CopyText } from "../controls/CopyText.js";
import { concatFilePath } from "../../domain/path.js";
import { FolderContents } from "./FolderContents.js";
import { StickyTitle } from "../text/StickyTitle.js";
import { SortedFolder } from "../../domain/sortedOutput.js";

export class Folder {
    private box: ToggleableBox;
    private content: FolderContents;

    constructor(
        folder: SortedFolder,
        children: FolderContents,
    ) {
        this.content = children;

        const fullPath = concatFilePath(folder.path, folder.name);

        this.box = new ToggleableBox([
            StickyTitle([
                folder.name,
                CopyText(fullPath),
            ],
                folder.depth
            ),
        ],
            false,
        );

        this.box.changeHideableContent(() => [this.content.dom]);
    }

    get dom(): Node {
        return this.box.dom;
    }

    setOpenness(open: boolean) {
        this.box.setOpenness(open);
    }
}
