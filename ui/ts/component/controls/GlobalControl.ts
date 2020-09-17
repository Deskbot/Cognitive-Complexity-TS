import { addStyleSheet, element } from "../../framework.js";

addStyleSheet(import.meta.url);

export function GlobalControl(text: string, onClick: () => void) {
    const button = element(
        "button",
        { className: "globalcontrol" },
        text
    );
    button.addEventListener("click", onClick);
    return button;
}
