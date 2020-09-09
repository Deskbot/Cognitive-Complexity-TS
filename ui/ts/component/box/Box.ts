import { element, addStyleSheet, StatefulNode } from "../../framework";

addStyleSheet(import.meta.url);

export class Box implements StatefulNode {
    readonly dom = element("div", { className: "box" });

    rerender(childNodes: (Node | string)[]) {
        this.dom.innerHTML = "";
        this.dom.append(...childNodes);
    }
}
