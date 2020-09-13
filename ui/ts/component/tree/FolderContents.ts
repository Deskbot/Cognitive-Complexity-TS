import { ProgramOutput } from "../../../../shared/types";
import { Tree } from "../../controller/TreeController";
import { compareOutputs } from "../../domain/output";
import { Controller, element } from "../../framework";
import { mapFromArr } from "../../util";
import { SortedMap } from "../../util/SortedMap";
import { File } from "./File";
import { FileOrFolder } from "./FileOrFolder";
import { Folder } from "./Folder";

export class FolderContents implements Tree {
    readonly dom: HTMLElement;

    private pathToComplexity: ProgramOutput;
    private pathToComponent: SortedMap<string, File | Folder>;

    constructor(
        controller: Controller<Tree>,
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
        this.pathToComponent.sort((left, right) => compareOutputs(
            this.pathToComplexity[left],
            this.pathToComplexity[right]
        ));
        this.reorderContents();
    }

    sortInOrder() {
        this.pathToComponent.sort();
        this.reorderContents();
    }
}
