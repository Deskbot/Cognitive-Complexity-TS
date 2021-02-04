import { ProgramOutput } from "../../../../shared/types.js";
import { Tree } from "../../controller/TreeController.js";
import { compareOutputs } from "../../domain/output.js";
import { Controller, element } from "../../framework.js";
import { arrayToMap } from "../../util/util.js";
import { SortedMap } from "../../util/SortedMap.js";
import { File } from "./File.js";
import { FileOrFolder } from "./FileOrFolder.js";
import { Folder } from "./Folder.js";

export class FolderContents {
    readonly dom: HTMLElement;

    private pathToComplexity: ProgramOutput;
    private pathToComponent: SortedMap<string, File | Folder>;

    constructor(
        controller: Controller<Tree>,
        complexity: ProgramOutput,
        path: string,
        startOpen: boolean
    ) {
        this.pathToComplexity = complexity;

        this.pathToComponent = new SortedMap(arrayToMap(
            Object.keys(complexity),
            name => FileOrFolder(controller, path, name, complexity[name], startOpen)
        ));

        for (const component of this.pathToComponent.values()) {
            controller.register(component);
        }

        this.dom = element("div");

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
