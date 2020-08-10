import { Box } from "../Box";
import { ToggleButton } from "./ToggleButton";

export function ToggleableBox(visibleContent: Node[], toggleableContent: Node[]): Node {
    const boxContents = [] as Node[];

    if (toggleableContent.length > 0) {
        const toggleButton = ToggleButton(false, onNewIsOpen);
        boxContents.push(toggleButton);
    }

    boxContents.push(...visibleContent);

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
