import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { element } from "../framework";
import { Box } from "./Box";
import { ToggleButton } from "./generic/ToggleButton";

export function FolderComplexity(name: string, complexity: FolderOutput): Node {
    const toggleButton = ToggleButton(false, onNewIsOpen);
    const boxContents = [
        toggleButton,
        element("p", {}, [name]),
    ];

    function onNewIsOpen(newIsOpen: boolean) {
        if (newIsOpen) {
            box.rerender([...boxContents, ...CognitiveComplexityUi(complexity)]);
        } else {
            box.rerender(boxContents);
        }
    }

    const box = new Box();
    box.rerender(boxContents);

    return box.dom;
}
