import { element } from "../../framework.js";
import { File } from "./File.js";
import { Folder } from "./Folder.js";

export class FolderContents {
    readonly dom: HTMLElement;

    constructor(private children: (File | Folder)[]) {
        this.dom = element("div");
        this.dom.append(...children.map(child => child.dom));
    }

    setChildren(children: (File | Folder)[]) {
        this.children = children;

        this.dom.innerHTML = "";
        this.dom.append(...children.map(child => child.dom));
    }

    setOpenness(open: boolean) {
        this.children.forEach(child => child.setOpenness(open));
    }
}
