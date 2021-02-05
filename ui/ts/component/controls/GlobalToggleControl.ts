import { addStyleSheet, element } from "../../framework.js";
import { url } from "./GlobalControl.js";

addStyleSheet(url);
addStyleSheet(import.meta.url);

export function GlobalToggleControl(initialState: boolean, getName: (state: boolean) => string, onClick: () => void) {
    let state = initialState;

    const buttonText = element("span", {}, getName(initialState));
    const checkbox = element("input", { type: "checkbox", checked: initialState });

    const button = element(
        "button",
        { className: "globalcontrol globaltogglecontrol" },
        checkbox,
        buttonText,
    );

    button.addEventListener("click", () => {
        state = !state;
        checkbox.checked = state;
        buttonText.innerText = getName(checkbox.checked);

        onClick();
    });

    return button;
}
