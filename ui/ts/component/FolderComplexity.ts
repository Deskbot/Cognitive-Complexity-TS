import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { ToggleableBox } from "./generic/ToggleableBox";
import { CopyButton } from "./generic/CopyableText";
import { element } from "../framework";

export function FolderComplexity(name: string, complexity: FolderOutput, startOpen: boolean): Node {
    return ToggleableBox(
        [element("p", {}, [
            name,
            CopyButton(name),
        ])],
        () => CognitiveComplexityUi(complexity, false),
        startOpen,
    );
}
