import { addStyleSheet, element, fragment } from "../../framework.js";
import { ButtonControl } from "./ButtonControl.js";

addStyleSheet(import.meta.url);

export class ToggleControl {
    readonly dom: Node;

    private cross: SVGElement;
    private tick: SVGElement;

    private state: boolean;

    constructor(initialState: boolean, inner: string | Node, onManualChange: (state: boolean) => void) {
        this.state = initialState;

        const buttonText = element("span", {}, inner);

        this.cross = CrossSvg();
        this.tick = TickSvg();
        this.cross.classList.add("togglecontrol-svg");
        this.tick.classList.add("togglecontrol-svg");

        this.dom = ButtonControl(
            fragment(
                this.state ? this.tick : this.cross,
                buttonText,
            ),
            () => {
                this.toggleState();
                onManualChange(this.state);
            }
        );
    }

    private onChange() {
        if (this.state) {
            this.cross.parentElement?.replaceChild(this.tick, this.cross);
        } else {
            this.tick.parentElement?.replaceChild(this.cross, this.tick);
        }
    }

    getState(): boolean {
        return this.state;
    }

    setState(state: boolean) {
        this.state = state;
        this.onChange();
    }

    private toggleState() {
        this.setState(!this.state);
    }
}

const crossTemplate = element("template");
crossTemplate.innerHTML =
    `<svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" height="10" width="10" viewbox="0 0 10 10">
        <polygon points="0,1, 1,0, 5.5,3.5, 9,0, 10,1, 6,5.5, 10,9, 9,10, 4.5,6.5, 1,10, 0,9, 4,4.5"/>
    </svg>`;

function CrossSvg(): SVGElement {
    return crossTemplate.content.firstElementChild!.cloneNode(true) as SVGElement;
}

const tickTemplate = element("template");
tickTemplate.innerHTML =
    `<svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" height="10" width="10" viewbox="0 0 10 10">
        <polygon points="1,5, 4,7, 9,0, 10,1, 4,10, 0,6"/>
    </svg>`;

function TickSvg(): SVGElement {
    return tickTemplate.content.firstElementChild!.cloneNode(true) as SVGElement;
}
