import { element } from "../../framework.js";
import { File } from "./File.js";
import { Folder } from "./Folder.js";

export class FolderContents {
    readonly dom: HTMLElement;

    constructor(
        children: (File | Folder)[],
    ) {
        this.dom = element("div");
        this.dom.append(...children.map(child => child.dom));
    }
}
