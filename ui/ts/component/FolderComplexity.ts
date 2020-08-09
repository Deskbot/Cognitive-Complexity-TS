import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { element, addStyleSheet } from "../framework";
import { Box } from "./Box";

export function FolderComplexity(name: string, complexity: FolderOutput): Node {
    return Box([
        element("p", {}, [name]),
        CognitiveComplexityUi(complexity)
    ]);
}
