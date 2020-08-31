import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { ToggleableBox } from "./generic/ToggleableBox";
import { element } from "../framework";
import { CopyText } from "./generic/CopyText";

export function FolderComplexity(name: string, complexity: FolderOutput, startOpen: boolean): ToggleableBox {
    return new ToggleableBox([
        element("p", {},
            name,
            CopyText(name),
        ),
    ],
        () => CognitiveComplexityUi(complexity, false),
        startOpen,
    );
}
