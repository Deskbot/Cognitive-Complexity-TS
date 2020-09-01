import { ProgramOutput } from "../../../shared/types";
import { element } from "../framework";
import { record } from "../util";
import { FileComplexity } from "./FileComplexity";
import { FileOrFolderComplexity } from "./FileOrFolderComplexity";
import { FolderComplexity } from "./FolderComplexity";

export class CognitiveComplexityUi {
    readonly dom: Element;
    private filesOrFolders: Record<string, FileComplexity | FolderComplexity>;

    private complexity: ProgramOutput;
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
            .map(f => f.setTreeOpenness(open));
    }

    sortByComplexity() {
        this.paths.sort((left, right) => {
            const leftScore = this.complexity[left].score;
            const rightScore = this.complexity[right].score;

            const leftHasScore = typeof leftScore === "number";
            const rightHasScore = typeof rightScore === "number";

            if (leftHasScore && rightHasScore) {
                // If the typeof statements were directly in the if condition,
                // the casting would not be required by TypeScript.
                return (rightScore as number) - (leftScore as number);
            }

            if (!leftHasScore && !rightHasScore) {
                return 0;
            }

            if (!leftHasScore) {
                return 1;
            }

            if (!rightHasScore) {
                return 1;
            }

            return 0; // unreachable
        });
        this.reorderContents();
    }

    sortInOrder() {
        this.paths.sort();
        this.reorderContents();
    }
}
