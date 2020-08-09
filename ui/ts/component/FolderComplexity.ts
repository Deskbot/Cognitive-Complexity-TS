import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { element, StatefulNode } from "../framework";
import { Box } from "./Box";
import { ToggleButton } from "./generic/ToggleButton";

export class FolderComplexity implements StatefulNode {
    private isOpen = false;
    private box = new Box();
    private lastRender: [showFolderContent: boolean, name: string, complexity: FolderOutput] | undefined;
    private toggleButton = ToggleButton(this.isOpen, (newIsOpen) => {
        this.isOpen = newIsOpen;
        this.realRender(this.isOpen, this.lastRender![1], this.lastRender![2]);
    });

    readonly dom = this.box.dom;

    render(name: string, complexity: FolderOutput) {
        this.realRender(this.isOpen, name, complexity);
    }

    private realRender(showFolderContent: boolean, name: string, complexity: FolderOutput) {
        this.lastRender = [showFolderContent, name, complexity];

        const boxContents = [
            this.toggleButton,
            element("p", {}, [name]),
        ];

        if (showFolderContent) {
            boxContents.push(...CognitiveComplexityUi(complexity));
        }

        this.box.render(boxContents);
    }
}
