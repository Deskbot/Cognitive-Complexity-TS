import { ProgramOutput } from "../../../shared/types";
import { FileOrFolderComplexity } from "./FileOrFolderComplexity";
import { ToggleableBox } from "./generic/ToggleableBox";

export function CognitiveComplexityUi(complexity: ProgramOutput, startOpen: boolean): ToggleableBox[] {
    const files = Object.keys(complexity).sort();

    return files.map(filePath => FileOrFolderComplexity(filePath, complexity[filePath], startOpen));
}
