import { Tree } from "../component/tree/Tree.js";
import { SortedContainerOutput, SortedFileOutput, SortedFolderOutput, SortedProgramOutput, isSortedContainerOutput, isSortedFileOutput } from "../domain/sortedOutput.js";
import { Store } from "../framework.js";

export class ComplexityModel {
    private containers = new Store<SortedContainerOutput>();
    private files = new Store<SortedFileOutput>();
    private folderContents = new Store<SortedFolderOutput>();

    constructor(private view: Tree) {

    }

    overwriteComplexity(complexity: SortedProgramOutput) {
        this.overwriteFolderContents(complexity);
    }

    private overwriteContainer(containerOutput: SortedContainerOutput) {
        const observableContainer = this.containers.set(containerOutput);
        observableContainer.onChange(newContainer => this.view.reChildContainer(newContainer));

        for (const container of containerOutput.inner) {
            this.overwriteContainer(container);
        }
    }

    private overwriteFile(fileOutput: SortedFileOutput) {
        const observableFile = this.files.set(fileOutput);
        observableFile.onChange(newFile => this.view.reChildFile(newFile));

        for (const containerOutput of fileOutput.inner) {
            this.overwriteContainer(containerOutput);
        }
    }

    private overwriteFolderContents(folderOutput: SortedFolderOutput) {
        const observableFolderContents = this.folderContents.set(folderOutput);
        observableFolderContents.onChange(newFolder => this.view.reChildFolderContents(newFolder));

        folderOutput.inner.forEach((folderEntry) => {
            isSortedContainerOutput(folderEntry)
                ? this.overwriteContainer(folderEntry)
                : isSortedFileOutput(folderEntry)
                    ? this.overwriteFile(folderEntry)
                    : this.overwriteFolder(folderEntry);
        });
    }

    private overwriteFolder(folderOutput: SortedFolderOutput) {
        this.overwriteFolderContents(folderOutput)
    }
}