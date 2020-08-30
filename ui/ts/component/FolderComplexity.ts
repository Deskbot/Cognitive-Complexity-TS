import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { ToggleableBox } from "./generic/ToggleableBox";
import { StickyText } from "./generic/StickyText";

export function FolderComplexity(name: string, complexity: FolderOutput, startOpen: boolean): ToggleableBox {
    return new ToggleableBox([
        StickyText(name)
    ],
        () => CognitiveComplexityUi(complexity, false),
        startOpen,
    );
}
