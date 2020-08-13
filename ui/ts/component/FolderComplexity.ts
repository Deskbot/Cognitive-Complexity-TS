import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { ToggleableBox } from "./generic/ToggleableBox";
import { CopyableText } from "./generic/CopyableText";

export function FolderComplexity(name: string, complexity: FolderOutput, startOpen: boolean): Node {
    return ToggleableBox(
        [CopyableText(name)],
        CognitiveComplexityUi(complexity, false),
        startOpen,
    );
}
