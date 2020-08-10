import { Box } from "../Box";
import { ToggleButton } from "./ToggleButton";

export function ToggleableBox(boxContent: Node[], toggleableContent: Node[]): Node {
    const toggleButton = ToggleButton(false, onNewIsOpen);
    const boxContents = [
        toggleButton,
        ...boxContent,
    ];

    function onNewIsOpen(newIsOpen: boolean) {
        if (newIsOpen) {
            box.rerender([...boxContents, ...toggleableContent]);
        } else {
            box.rerender(boxContents);
        }
    }

    const box = new Box();
    box.rerender(boxContents);

    return box.dom;
}
