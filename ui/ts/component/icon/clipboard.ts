import { addStyleSheet } from "../../framework";

addStyleSheet("/css/component/icon/clipboard");

export function ClipboardSvg() {
    const template = document.getElementById("clipboard-icon") as HTMLTemplateElement;
    return template.content.cloneNode(true);
}
