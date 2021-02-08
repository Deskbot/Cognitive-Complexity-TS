import { addStyleSheet, element } from "../../framework.js";

addStyleSheet(import.meta.url);

export function GlobalControl(inner: string | Node, onClick: () => void) {
    const button = element(
        "button",
        { className: "globalcontrol" },
        inner
    );
    button.addEventListener("click", onClick);
    return button;
}
