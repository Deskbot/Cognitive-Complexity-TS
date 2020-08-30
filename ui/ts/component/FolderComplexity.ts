import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { ToggleableBox } from "./generic/ToggleableBox";
import { StickyTitle } from "./StickyTitle";

export function FolderComplexity(name: string, complexity: FolderOutput, startOpen: boolean): ToggleableBox {
    return new ToggleableBox([
        StickyTitle(name)
    ],
        () => CognitiveComplexityUi(complexity, false),
        startOpen,
    );
}
