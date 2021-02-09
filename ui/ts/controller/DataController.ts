import { ProgramOutput } from "../../../shared/types.js";
import { Container } from "../component/tree/Container.js";
import { File } from "../component/tree/File.js";
import { Folder } from "../component/tree/Folder.js";
import { FolderContents } from "../component/tree/FolderContents.js";
import { cloneSortedOutput, convertToSortedOutput, isSortedFileOutput, SortedContainerOutput, SortedFileOutput, SortedFolderOutput, SortedProgramOutput, sortProgramByComplexity, sortProgramInOrder } from "../domain/sortedOutput.js";
import { TreeController } from "./TreeController.js";

export class DataController {
    private complexity: SortedProgramOutput;
    private initialComplexity: SortedProgramOutput;

    private treeController: TreeController;
    private containerMap: Map<SortedContainerOutput, Container> = new Map();
    private folderMap: Map<SortedFolderOutput, Folder> = new Map();
    private fileMap: Map<SortedFileOutput, File> = new Map();
    private folderContentsMap: Map<SortedFolderOutput, FolderContents> = new Map();

    constructor(progComp: ProgramOutput, treeController: TreeController) {
        this.complexity = convertToSortedOutput(progComp);
        this.initialComplexity = cloneSortedOutput(this.complexity);
        sortProgramInOrder(this.complexity);
        this.treeController = treeController;
    }

    makeTree() {
        const contents = this.makeFolderContents(this.complexity);

        // If there is only one top level node, show it expanded.
        // Otherwise show all nodes minimised by default.
        const onlyOneTopLevelNode = this.complexity.inner.length <= 1;

        if (onlyOneTopLevelNode) {
            contents.setOpenness(true);
        }

        return contents;
    }

    private makeContainer(containerOutput: SortedContainerOutput): Container {
        if (this.containerMap.has(containerOutput)) {
            return this.containerMap.get(containerOutput)!;
        }

        const container = new Container(containerOutput, containerOutput.path, containerOutput.inner.map(inner => this.makeContainer(inner)));
        this.treeController.register(container);
        this.containerMap.set(containerOutput, container);
        return container;
    }

    private makeFile(fileOutput: SortedFileOutput): File {
        if (this.fileMap.has(fileOutput)) {
            return this.fileMap.get(fileOutput)!;
        }

        const children = [] as Container[];

        for (const containerOutput of fileOutput.inner) {
            children.push(this.makeContainer(containerOutput));
        }

        const file = new File(fileOutput.path, fileOutput.name, fileOutput.score, children);

        this.treeController.register(file);
        this.fileMap.set(fileOutput, file);

        return file;
    }

    private makeFolderContents(folderOutput: SortedFolderOutput): FolderContents {
        if (this.folderContentsMap.has(folderOutput)) {
            return this.folderContentsMap.get(folderOutput)!;
        }

        const folderContents = new FolderContents(folderOutput.inner.map((folderEntry) => {
            const folderEntryComponent = isSortedFileOutput(folderEntry)
                ? this.makeFile(folderEntry)
                : this.makeFolder(folderEntry);

            return folderEntryComponent;
        }));

        this.folderContentsMap.set(folderOutput, folderContents);

        return folderContents;
    }

    private makeFolder(folderOutput: SortedFolderOutput): Folder {
        if (this.folderMap.has(folderOutput)) {
            return this.folderMap.get(folderOutput)!;
        }

        const folder = new Folder(folderOutput.path, folderOutput.name, this.makeFolderContents(folderOutput));
        this.treeController.register(folder);
        this.folderMap.set(folderOutput, folder);
        return folder;
    }

    private reChild() {
        // folder contents
        for (const [complexity, folderContents] of this.folderContentsMap) {
            folderContents.setChildren(complexity.inner.map((folderEntry) => {
                const folderEntryComponent = isSortedFileOutput(folderEntry)
                    ? this.makeFile(folderEntry)
                    : this.makeFolder(folderEntry);

                return folderEntryComponent;
            }));
        }

        // files
        for (const [complexity, file] of this.fileMap) {
            file.setChildren(complexity.inner.map(containerOutput => this.makeContainer(containerOutput)));
        }

        // containers
        for (const [complexity, container] of this.containerMap) {
            container.setChildren(complexity.inner.map(containerOutput => this.makeContainer(containerOutput)));
        }
    }

    sortByComplexity() {
        sortProgramByComplexity(this.complexity);
        this.reChild();
    }

    sortInOrder() {
        sortProgramInOrder(this.complexity);
        this.reChild();
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
