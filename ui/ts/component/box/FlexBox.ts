import { element, addStyleSheet } from "../../framework.js";

addStyleSheet(import.meta.url);

export class FlexBox {
    readonly dom = element("div", { className: "flexbox" });

    rerender(childNodes: (Node | string)[]) {
        this.dom.innerHTML = "";
        this.dom.append(...childNodes);
    }
}
