import { ProgramOutput } from "../../../shared/types";
import { element } from "../framework";
import { FileComplexity } from "./FileComplexity";
import { FileOrFolderComplexity } from "./FileOrFolderComplexity";
import { FolderComplexity } from "./FolderComplexity";

export class CognitiveComplexityUi {
    readonly dom: Element;
    private files: string[];
    private filesOrFolders: (FileComplexity | FolderComplexity)[];

    constructor(complexity: ProgramOutput, startOpen: boolean) {
        this.files = Object.keys(complexity).sort();

        this.dom = element("div", {});
        this.filesOrFolders = this.files.map(
            filePath => FileOrFolderComplexity(filePath, complexity[filePath], startOpen)
        );

        this.sortInOrder();
    }

    setTreeOpenness(open: boolean) {
        this.filesOrFolders.forEach(f => f.setTreeOpenness(open));
    }

    sortInOrder() {
        this.files.sort();
        this.dom.innerHTML = "";
        this.filesOrFolders
            .map(f => f.dom)
            .forEach((node) => {
                this.dom.append(node);
            });
    }
}
