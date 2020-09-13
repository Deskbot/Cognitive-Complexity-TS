import { ProgramOutput } from "../../../../shared/types";
import { TreeController } from "../../controller/TreeController";
import { compareOutputs } from "../../domain/output";
import { element } from "../../framework";
import { mapFromArr } from "../../util";
import { SortedMap } from "../../util/SortedMap";
import { File } from "./File";
import { FileOrFolder } from "./FileOrFolder";
import { Folder } from "./Folder";

export class FolderContents {
    readonly dom: HTMLElement;

    private pathToComplexity: ProgramOutput;
    private pathToComponent: SortedMap<string, File | Folder>;

    constructor(
        controller: TreeController,
        complexity: ProgramOutput,
        startOpen: boolean
    ) {
        this.pathToComplexity = complexity;

        this.pathToComponent = new SortedMap(mapFromArr(
            Object.keys(complexity),
            filePath => FileOrFolder(controller, filePath, complexity[filePath], startOpen)
        ));

        for (const component of this.pathToComponent.values()) {
            controller.register(component);
        }

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
