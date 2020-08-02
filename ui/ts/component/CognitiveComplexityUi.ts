import { ProgramOutput } from "../../../shared/types";
import { FileOrFolderComplexity } from "./FileOrFolderComplexity";
import { fragment } from "../framework";

export function CognitiveComplexityUi(complexity: ProgramOutput): Node {
    const files = Object.keys(complexity).sort();

    return fragment(
        files.map(filePath => FileOrFolderComplexity(filePath, complexity[filePath]))
    );
}
