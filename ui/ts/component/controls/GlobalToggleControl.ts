import { addStyleSheet, element, fragment } from "../../framework.js";
import { GlobalControl } from "./GlobalControl.js";

addStyleSheet(import.meta.url);

export class GlobalToggleControl {
    readonly dom: Node;

    private cross: SVGElement;
    private tick: SVGElement;

    private state: boolean;
    private externalOnStateChange: (state: boolean) => void;

    constructor(initialState: boolean, inner: string | Node, onStateChange: (state: boolean) => void) {
        this.state = initialState;
        this.externalOnStateChange = onStateChange;

        const buttonText = element("span", {}, inner);

        this.cross = CrossSvg();
        this.tick = TickSvg();
        this.cross.classList.add("globaltogglecontrol-svg");
        this.tick.classList.add("globaltogglecontrol-svg");

        this.dom = GlobalControl(
            fragment(
                this.state ? this.tick : this.cross,
                buttonText,
            ),
            () => this.toggleState()
        );
    }

    private onStateChange() {
        if (this.state) {
            this.cross.parentElement?.replaceChild(this.tick, this.cross);
        } else {
            this.tick.parentElement?.replaceChild(this.cross, this.tick);
        }

        this.externalOnStateChange(this.state);
    }

    getState(): boolean {
        return this.state;
    }

    setState(state: boolean) {
        this.state = state;
        this.onStateChange();
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
