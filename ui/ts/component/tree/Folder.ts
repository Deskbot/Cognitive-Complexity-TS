import { ToggleableBox } from "../box/ToggleableBox.js";
import { element } from "../../framework.js";
import { CopyText } from "../controls/CopyText.js";
import { concatFilePath } from "../../domain/path.js";
import { FolderContents } from "./FolderContents.js";

export class Folder {
    private box: ToggleableBox;
    private content: FolderContents;

    constructor(
        path: string,
        name: string,
        children: FolderContents,
    ) {
        this.content = children;

        const fullPath = concatFilePath(path, name);

        this.box = new ToggleableBox([
            element("p", {},
                name,
                CopyText(fullPath),
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
