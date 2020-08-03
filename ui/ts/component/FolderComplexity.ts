import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { element, addStyleSheet } from "../framework";

addStyleSheet("/css/component/FolderComplexity");

export function FolderComplexity(name: string, complexity: FolderOutput): Node {
    return element("div", {
        className: "folder-complexity"
    }, [
        element("p", {}, [name]),
        CognitiveComplexityUi(complexity)
    ]);
}
