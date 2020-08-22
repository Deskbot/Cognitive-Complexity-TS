import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { ToggleableBox } from "./generic/ToggleableBox";
import { CopyText } from "./generic/CopyText";
import { element } from "../framework";

export function FolderComplexity(name: string, complexity: FolderOutput, startOpen: boolean): Node {
    return ToggleableBox(
        [element("p", {},
            name,
            CopyText(name),
        )],
        () => CognitiveComplexityUi(complexity, false),
        startOpen,
    );
}
