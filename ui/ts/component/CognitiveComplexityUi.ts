import { ProgramOutput } from "../../../shared/types";
import { FileOrFolderComplexity } from "./FileOrFolderComplexity";

export function CognitiveComplexityUi(complexity: ProgramOutput, startOpen: boolean): Node[] {
    const files = Object.keys(complexity).sort();

    return files.map(filePath => FileOrFolderComplexity(filePath, complexity[filePath], startOpen));
}
