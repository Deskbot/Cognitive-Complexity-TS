import { CognitiveComplexityUi } from "./CognitiveComplexityUi";
import { FolderOutput } from "../../../shared/types";
import { element, StatefulNode } from "../framework";
import { Box } from "./Box";
import { ToggleButton } from "./generic/ToggleButton";

export class FolderComplexity implements StatefulNode {
    private showFolderContent = false;
    private box = new Box();
    private toggleButton = ToggleButton(this.showFolderContent, (newIsOpen) => {
        this.showFolderContent = newIsOpen;
        this.rerender();
    });

    readonly dom = this.box.dom;

    constructor(private name: string, private complexity: FolderOutput) {
        this.rerender();
    }

    rerender() {
        const boxContents = [
            this.toggleButton,
            element("p", {}, [this.name]),
        ];

        if (this.showFolderContent) {
            boxContents.push(...CognitiveComplexityUi(this.complexity));
        }

        this.box.rerender(boxContents);
    }
}
