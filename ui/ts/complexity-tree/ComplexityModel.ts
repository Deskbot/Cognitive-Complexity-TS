import { Tree } from "../component/tree/Tree.js";
import { SortedContainer, SortedFile, SortedFolder, SortedProgram, isSortedContainerOutput, isSortedFileOutput } from "../domain/sortedOutput.js";
import { Store } from "../framework.js";

/**
 * Holds the live copy of the current representation of the complexity tree.
 * Responsible for driving changes to the tree view in response to changes to the representation of the tree.
 */
export class ComplexityModel {
    private containers = new Store<SortedContainer>();
    private files = new Store<SortedFile>();
    private folders = new Store<SortedFolder>();

    constructor(private view: Tree) {

    }

    // update

    updateContainer(container: SortedContainer) {
        this.containers.set(container);
    }

    updateFile(file: SortedFile) {
        this.files.set(file);
    }

    updateFolder(folder: SortedFolder) {
        this.folders.set(folder);
    }

    // overwrite

    overwriteComplexity(complexity: SortedProgram) {
        this.overwriteFolderContents(complexity);
    }

    private overwriteContainer(containerOutput: SortedContainer) {
        const observableContainer = this.containers.set(containerOutput);
        observableContainer.onChange((newContainer) => {
            this.view.reChildContainer(newContainer);
            this.view.reDepthContainer(newContainer);
        });

        for (const container of containerOutput.inner) {
            this.overwriteContainer(container);
        }
    }

    private overwriteFile(fileOutput: SortedFile) {
        const observableFile = this.files.set(fileOutput);
        observableFile.onChange((newFile) => {
            this.view.reChildFile(newFile);
            this.view.reDepthFile(newFile);
        });

        for (const containerOutput of fileOutput.inner) {
            this.overwriteContainer(containerOutput);
        }
    }

    private overwriteFolderContents(folderOutput: SortedFolder) {
        const observableFolder = this.folders.set(folderOutput);
        observableFolder.onChange((newFolder) => {
            this.view.reChildFolderContents(newFolder);
        });

        folderOutput.inner.forEach((folderEntry) => {
            isSortedContainerOutput(folderEntry)
                ? this.overwriteContainer(folderEntry)
                : isSortedFileOutput(folderEntry)
                    ? this.overwriteFile(folderEntry)
                    : this.overwriteFolder(folderEntry);
        });
    }

    private overwriteFolder(folderOutput: SortedFolder) {
        this.overwriteFolderContents(folderOutput);

        const observableFolder = this.folders.get(folderOutput.id)!;
        observableFolder.onChange((newFolder) => {
            this.view.reChildFolderContents(newFolder);
            this.view.reDepthFolder(newFolder);
        });
    }
}