import { Tree } from "../component/tree/Tree.js";
import { SortedContainerOutput, SortedFileOutput, SortedFolderOutput, SortedProgramOutput, isSortedContainerOutput, isSortedFileOutput } from "../domain/sortedOutput.js";
import { Store } from "../framework.js";

export class ComplexityModel {
    private containerComplexityMap = new Store<SortedContainerOutput>();
    private fileComplexityMap = new Store<SortedFileOutput>();
    private folderContentsComplexityMap = new Store<SortedFolderOutput>();

    constructor(private view: Tree) {

    }

    changeComplexity(complexity: SortedProgramOutput) {
        this.changeFolderContents(complexity);
    }

    private changeContainer(containerOutput: SortedContainerOutput) {
        const observableContainer = this.containerComplexityMap.set(containerOutput);

        observableContainer.onChange(newContainer => this.view.reChildContainer(newContainer));

        for (const container of containerOutput.inner) {
            this.changeContainer(container);
        }
    }

    private changeFile(fileOutput: SortedFileOutput) {
        const observableFile = this.fileComplexityMap.set(fileOutput);
        observableFile.onChange(newFile => this.view.reChildFile(newFile));

        for (const containerOutput of fileOutput.inner) {
            this.changeContainer(containerOutput);
        }
    }

    private changeFolderContents(folderOutput: SortedFolderOutput) {
        const observableFolderContents = this.folderContentsComplexityMap.set(folderOutput);
        observableFolderContents.onChange(newFolder => this.view.reChildFolderContents(newFolder));

        folderOutput.inner.forEach((folderEntry) => {
            isSortedContainerOutput(folderEntry)
                ? this.changeContainer(folderEntry)
                : isSortedFileOutput(folderEntry)
                    ? this.changeFile(folderEntry)
                    : this.changeFolder(folderEntry);
        });
    }

    private changeFolder(folderOutput: SortedFolderOutput) {
        this.changeFolderContents(folderOutput)
    }
}