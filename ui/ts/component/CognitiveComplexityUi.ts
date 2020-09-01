import { ProgramOutput } from "../../../shared/types";
import { element } from "../framework";
import { FileComplexity } from "./FileComplexity";
import { FileOrFolderComplexity } from "./FileOrFolderComplexity";
import { FolderComplexity } from "./FolderComplexity";

export class CognitiveComplexityUi {
    readonly dom: Node;
    private filesOrFolders: (FileComplexity | FolderComplexity)[];

    constructor(complexity: ProgramOutput, startOpen: boolean) {
        const files = Object.keys(complexity).sort();
        this.filesOrFolders = files.map(filePath => FileOrFolderComplexity(filePath, complexity[filePath], startOpen));
        this.dom = element("div", {}, ...this.filesOrFolders.map(f => f.dom));
    }

    setTreeOpenness(open: boolean) {
        this.filesOrFolders.forEach(f => f.setTreeOpenness(open));
    }
}
