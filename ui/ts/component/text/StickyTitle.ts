import { addStyleSheet, element } from "../../framework.js";

addStyleSheet(import.meta.url);

const maxZIndex = 2147483647;

export class StickyTitle {
    readonly dom: HTMLParagraphElement;

    constructor(title: (string | Node)[], depth: number) {
        this.dom = element("p", { className: "stickytext" }, ...title);
        this.setDepth(depth);
    }

    setDepth(depth: number) {
        this.dom.style.top = `${39 * (depth - 1)}px`; // boo! number comes from looking at the real height in the browser
        this.dom.style.zIndex = (maxZIndex - depth).toString();
    }
}
