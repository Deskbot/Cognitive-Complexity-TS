import { ProgramOutput } from "../../../shared/types.js";
import { Container } from "../component/tree/Container.js";
import { File } from "../component/tree/File.js";
import { Folder } from "../component/tree/Folder.js";
import { FolderContents } from "../component/tree/FolderContents.js";
import { convertToSortedOutput, isSortedFileOutput, SortedContainerOutput, SortedFileOutput, SortedFolderOutput, SortedProgramOutput, sortProgramByComplexity, sortProgramInOrder } from "../domain/sortedOutput.js";
import { TreeController } from "./TreeController.js";

export class DataController {
    private complexity: SortedProgramOutput;
    private treeController: TreeController;

    constructor(progComp: ProgramOutput, treeController: TreeController) {
        this.complexity = convertToSortedOutput(progComp);
        this.treeController = treeController;
    }

    makeTree() {
        // If there is only one top level node, show it expanded.
        // Otherwise show all nodes minimised by default.
        const onlyOneTopLevelNode = this.complexity.inner.length <= 1;
        return this.makeFolderContents(this.complexity, onlyOneTopLevelNode);
    }

    private makeContainer(containerOutput: SortedContainerOutput): Container {
        const container = new Container(containerOutput, containerOutput.path, containerOutput.inner.map(inner => this.makeContainer(inner)));
        this.treeController.register(container);
        return container;
    }

    private makeFile(fileOutput: SortedFileOutput, startOpen: boolean): File {
        const children = [] as Container[];

        for (const containerOutput of fileOutput.inner) {
            children.push(this.makeContainer(containerOutput));
        }

        const file = new File(fileOutput.path, fileOutput.name, fileOutput.score, startOpen, children);

        this.treeController.register(file);

        return file;
    }

    private makeFolderContents(folder: SortedFolderOutput, startOpen: boolean): FolderContents {
        return new FolderContents(folder.inner.map((folderEntry) => {
            const folderEntryComponent = isSortedFileOutput(folderEntry)
                ? this.makeFile(folderEntry, startOpen)
                : this.makeFolder(folderEntry, startOpen);

            this.treeController.register(folderEntryComponent);

            return folderEntryComponent;
        }));
    }

    private makeFolder(folderOutput: SortedFolderOutput, startOpen: boolean): Folder {
        const folder = new Folder(folderOutput.path, folderOutput.name, startOpen, this.makeFolderContents(folderOutput, false));
        this.treeController.register(folder);
        return folder;
    }

    sortByComplexity() {
        sortProgramByComplexity(this.complexity);
    }

    sortInOrder() {
        sortProgramInOrder(this.complexity);
    }

    hideFiles() {

    }

    showFiles() {

    }

    hideFolders() {

    }

    showFolders() {

    }

}
