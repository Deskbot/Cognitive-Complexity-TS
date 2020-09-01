import { ProgramOutput } from "../../../shared/types";
import { FileComplexity } from "./FileComplexity";
import { FileOrFolderComplexity } from "./FileOrFolderComplexity";
import { FolderComplexity } from "./FolderComplexity";

export function CognitiveComplexityUi(complexity: ProgramOutput, startOpen: boolean): (FileComplexity | FolderComplexity)[] {
    const files = Object.keys(complexity).sort();

    return files.map(filePath => FileOrFolderComplexity(filePath, complexity[filePath], startOpen));
}
