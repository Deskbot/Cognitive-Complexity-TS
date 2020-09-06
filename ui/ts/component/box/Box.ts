import { element, addStyleSheet, StatefulNode, emptyChildNodes } from "../../framework";

addStyleSheet(import.meta.url);

export class Box implements StatefulNode {
    readonly dom = element("div", { className: "box" });

    rerender(childNodes: (Node | string)[]) {
        emptyChildNodes(this.dom);
        this.dom.append(...childNodes);
    }
}
