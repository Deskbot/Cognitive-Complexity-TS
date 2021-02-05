import { ProgramOutput } from "../../../shared/types.js";
import { convertToSortedOutput, SortedProgramOutput, sortFolderByComplexity, sortFolderInOrder } from "../domain/sortedOutput.js";

export class DataController {
    private complexity: SortedProgramOutput;

    constructor(progComp: ProgramOutput) {
        this.complexity = convertToSortedOutput(progComp);
    }

    sortByComplexity() {
        sortFolderByComplexity(this.complexity);
    }

    sortInOrder() {
        sortFolderInOrder(this.complexity);
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
