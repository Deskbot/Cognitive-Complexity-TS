import { addStyleSheet, element } from "../../framework.js";

addStyleSheet(import.meta.url);

export function ButtonControl(inner: string | Node, onClick: () => void) {
    const button = element(
        "button",
        { className: "buttoncontrol" },
        inner
    );
    button.addEventListener("click", onClick);
    return button;
}
