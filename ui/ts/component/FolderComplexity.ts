import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { element, StatefulNode } from "../framework";
import { Box } from "./Box";
import { ToggleButton } from "./generic/ToggleButton";

export class FolderComplexity implements StatefulNode {
    private isOpen = false;
    private box = new Box();
    private lastRender: [name: string, complexity: FolderOutput] | undefined;
    private toggleButton = ToggleButton(this.isOpen, (newIsOpen) => {
        console.log(newIsOpen)
        this.isOpen = newIsOpen;
        this.rerender();
    });

    readonly dom = this.box.dom;

    render(name: string, complexity: FolderOutput) {
        this.lastRender = [name, complexity];

        const boxContents = [
            this.toggleButton,
            element("p", {}, [name]),
        ];

        if (this.isOpen) {
            boxContents.push(...CognitiveComplexityUi(complexity));
        }

        this.box.render(boxContents);
    }

    private rerender() {
        if (this.lastRender) {
            this.render(...this.lastRender);
        }
    }
}
