import { addStyleSheet, element } from "../../framework.js";

addStyleSheet(import.meta.url);

export function StickyTitle(title: (string | Node)[]): Node {
    return element("p", { className: "stickytext" },
        ...title
    );
}
