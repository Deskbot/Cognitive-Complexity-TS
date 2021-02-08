import { ProgramOutput } from "../../../shared/types.js";
import { convertToSortedOutput, SortedProgramOutput, sortProgramByComplexity, sortProgramInOrder } from "../domain/sortedOutput.js";

export class DataController {
    private complexity: SortedProgramOutput;

    constructor(progComp: ProgramOutput) {
        this.complexity = convertToSortedOutput(progComp);
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
