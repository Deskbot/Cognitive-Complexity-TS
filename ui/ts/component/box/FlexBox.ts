import { element, addStyleSheet, StatefulNode } from "../../framework";

addStyleSheet(import.meta.url);

export class FlexBox implements StatefulNode {
    readonly dom = element("div", { className: "flexbox" });

    rerender(childNodes: (Node | string)[]) {
        this.dom.innerHTML = "";
        this.dom.append(...childNodes);
    }
}
