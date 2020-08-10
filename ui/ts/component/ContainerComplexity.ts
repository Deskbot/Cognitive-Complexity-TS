import { ContainerOutput } from "../../../shared/types";
import { element } from "../framework";
import { Box } from "./Box";
import { ToggleButton } from "./generic/ToggleButton";

export function ContainerComplexity(complexity: ContainerOutput): Node {
    const toggleButton = ToggleButton(false, onNewIsOpen);
    const boxContents = [
        toggleButton,
        element("p", {},
            [`${complexity.name} Line ${complexity.line}, Column ${complexity.column}`]
        ),
        element("p", {},
            [`Score: ${complexity.score}`]
        ),
    ];

    function onNewIsOpen(newIsOpen: boolean) {
        if (newIsOpen) {
            box.rerender([...boxContents, ...complexity.inner.map(ContainerComplexity)]);
        } else {
            box.rerender(boxContents);
        }
    }

    const box = new Box();
    box.rerender(boxContents);

    return box.dom;
}
