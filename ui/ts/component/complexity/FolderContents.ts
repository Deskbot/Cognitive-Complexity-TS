import { ProgramOutput } from "../../../../shared/types";
import { compareOutputs } from "../../domain/output";
import { element } from "../../framework";
import { mapFromArr } from "../../util";
import { SortedMap } from "../../util/SortedMap";
import { File } from "./File";
import { FileOrFolder } from "./FileOrFolder";
import { Folder } from "./Folder";

export class FolderContents {
    readonly dom: Element;

    private pathToComplexity: ProgramOutput;
    private pathToComponent: SortedMap<string, File | Folder>;

    constructor(complexity: ProgramOutput, startOpen: boolean) {
        this.pathToComplexity = complexity;

        this.pathToComponent = new SortedMap(mapFromArr(
            Object.keys(complexity),
            filePath => FileOrFolder(filePath, complexity[filePath], startOpen)
        ));

        this.dom = element("div", {});

        this.sortInOrder();
    }

    private reorderContents() {
        this.dom.innerHTML = "";
        this.pathToComponent.keys().forEach((path) => {
            const node = this.pathToComponent.get(path)!.dom;
            this.dom.append(node);
        });
    }

    setTreeOpenness(open: boolean) {
        for (const complexityComponent of this.pathToComponent.values()) {
            complexityComponent.setTreeOpenness(open);
        }
    }

    sortByComplexity() {
        this.pathToComponent.sort(
            (left, right) => compareOutputs(this.pathToComplexity[left], this.pathToComplexity[right])
        );
        this.reorderContents();
        this.sortChildrenByComplexity();
    }

    private sortChildrenByComplexity() {
        for (const component of this.pathToComponent.values()) {
            component.sortByComplexity();
        }
    }

    private sortChildrenInOrder() {
        for (const component of this.pathToComponent.values()) {
            component.sortInOrder();
        }
    }

    sortInOrder() {
        this.pathToComponent.sort();
        this.reorderContents();
        this.sortChildrenInOrder();
    }
}
