import { ProgramOutput } from "../../../shared/types.js";
import { convertToSortedOutput, SortedProgramOutput } from "../domain/sortedOutput.js";

export class DataController {
    private complexity: SortedProgramOutput;
    private initialComplexity: SortedProgramOutput;

    constructor(progComp: ProgramOutput) {
        this.complexity = convertToSortedOutput(progComp);
        this.initialComplexity = this.complexity;
    }

    sortByComplexity() {
        // sortFolderByComplexity(this.complexity);
    }

    sortInOrder() {
        // sortFolderInOrder(this.complexity);
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
