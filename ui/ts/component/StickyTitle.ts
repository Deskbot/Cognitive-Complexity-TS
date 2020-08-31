import { addStyleSheet, element } from "../framework";

addStyleSheet(import.meta.url);

export function StickyTitle(title: (string | Node)[]): Node {
    return element("p", { className: "stickytext" },
        ...title
    );
}
