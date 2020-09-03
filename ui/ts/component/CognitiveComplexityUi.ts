import { ProgramOutput } from "../../../shared/types";
import { compareOutputs } from "../domain/output";
import { element } from "../framework";
import { record } from "../util";
import { FileComplexity } from "./FileComplexity";
import { FileOrFolderComplexity } from "./FileOrFolderComplexity";
import { FolderComplexity } from "./FolderComplexity";

export class CognitiveComplexityUi {
    readonly dom: Element;

    private complexity: ProgramOutput;
    private filesOrFolders: Record<string, FileComplexity | FolderComplexity>;
    private paths: string[];

    constructor(complexity: ProgramOutput, startOpen: boolean) {
        this.complexity = complexity;
        this.paths = Object.keys(complexity).sort();

        this.dom = element("div", {});
        this.filesOrFolders = record(this.paths,
            filePath => FileOrFolderComplexity(filePath, complexity[filePath], startOpen)
        );

        this.sortInOrder();
    }

    private reorderContents() {
        this.dom.innerHTML = "";
        this.paths.forEach((path) => {
            const node = this.filesOrFolders[path].dom;
            this.dom.append(node);
        });
    }

    setTreeOpenness(open: boolean) {
        Object.values(this.filesOrFolders)
            .forEach(f => f.setTreeOpenness(open));
    }

    sortByComplexity() {
        this.paths.sort(
            (left, right) => compareOutputs(this.complexity[left], this.complexity[right])
        );
        this.reorderContents();
        this.sortChildrenByComplexity();
    }

    private sortChildrenByComplexity() {
        Object.values(this.filesOrFolders)
            .forEach((f) => {
                f.sortByComplexity();
            });
    }

    private sortChildrenInOrder() {
        Object.values(this.filesOrFolders)
            .forEach((f) => {
                f.sortInOrder();
            });
    }

    sortInOrder() {
        this.paths.sort();
        this.reorderContents();
        this.sortChildrenInOrder();
    }
}
