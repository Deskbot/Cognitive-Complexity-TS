import { addStyleSheet, element, fragment } from "../../framework.js";
import { GlobalControl } from "./GlobalControl.js";

addStyleSheet(import.meta.url);

export function GlobalToggleControl(initialState: boolean, inner: string | Node, onClick: () => void) {
    let state = initialState;

    const buttonText = element("span", {}, inner);

    const cross = CrossSvg();
    const tick = TickSvg();
    cross.classList.add("globaltogglecontrol-svg");
    tick.classList.add("globaltogglecontrol-svg");

    const button = GlobalControl(
        fragment(
            state ? tick : cross,
            buttonText,
        ),
        () => {
            state = !state;

            if (state) {
                cross.parentElement?.replaceChild(tick, cross);
            } else {
                tick.parentElement?.replaceChild(cross, tick);
            }

            onClick();
        }
    );

    return button;
}

const crossTemplate = element("template");
crossTemplate.innerHTML =
    `<svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" height="10" width="10" viewBox="0 0 10 10">
        <polygon points="0,1, 1,0, 5,4, 9,0, 10,1, 6,5, 10,9, 9,10, 5,6, 1,10, 0,9, 4,5"/>
    </svg>`;

function CrossSvg(): SVGElement {
    return crossTemplate.content.firstElementChild!.cloneNode(true) as SVGElement;
}

const tickTemplate = element("template");
tickTemplate.innerHTML =
    `<svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink" height="10" width="10" viewBox="2 2 8 8">
        <polygon points="3,7, 4,8, 9,3, 10,4, 4,10, 2,8"/>
    </svg>`;

function TickSvg(): SVGElement {
    return tickTemplate.content.firstElementChild!.cloneNode(true) as SVGElement;
}
