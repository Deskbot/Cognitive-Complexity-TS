import { ProgramOutput } from "../../../shared/types.js";
import { Container } from "../component/tree/Container.js";
import { File } from "../component/tree/File.js";
import { Folder } from "../component/tree/Folder.js";
import { FolderContents } from "../component/tree/FolderContents.js";
import { convertToSortedOutput, isSortedFileOutput, SortedContainerOutput, SortedFileOutput, SortedFolderOutput, SortedProgramOutput, sortProgramByComplexity, sortProgramInOrder } from "../domain/sortedOutput.js";

export class DataController {
    private complexity: SortedProgramOutput;

    constructor(progComp: ProgramOutput) {
        this.complexity = convertToSortedOutput(progComp);
    }

    makeTree() {
        // If there is only one top level node, show it expanded.
        // Otherwise show all nodes minimised by default.
        const onlyOneTopLevelNode = this.complexity.inner.length <= 1;
        return this.makeFolderContents(this.complexity, onlyOneTopLevelNode);
    }

    private makeContainer(container: SortedContainerOutput): Container {
        return new Container(container, container.path, container.inner.map(inner => this.makeContainer(inner)));
    }

    private makeFile(fileOutput: SortedFileOutput, startOpen: boolean): File {
        const children = [] as Container[];

        for (const containerOutput of fileOutput.inner) {
            children.push(this.makeContainer(containerOutput));
        }

        return new File(fileOutput.path, fileOutput.name, fileOutput.score, startOpen, children);
    }

    private makeFolderContents(folder: SortedFolderOutput, startOpen: boolean): FolderContents {
        return new FolderContents(folder.inner.map((entry) => {
            if (isSortedFileOutput(entry)) {
                return this.makeFile(entry, startOpen);
            } else {
                return this.makeFolder(entry, startOpen);
            }
        }));
    }

    private makeFolder(folderOutput: SortedFolderOutput, startOpen: boolean): Folder {
        return new Folder(folderOutput.path, folderOutput.name, startOpen, this.makeFolderContents(folderOutput, false));
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
