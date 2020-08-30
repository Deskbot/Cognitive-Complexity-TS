import { addStyleSheet, element } from "../../framework";
import { CopyText } from "../generic/CopyText";

addStyleSheet("/css/component/generic/StickyText");

const stickyTextVisibilityObserver = new IntersectionObserver((entries) => {
    let lowestAboveTop: HTMLParagraphElement | undefined;
    let lowestHeightAboveTop = Infinity;

    for (const entry of entries) {
        if (!entry.rootBounds) {
            continue;
        }

        const topOfScreen = entry.rootBounds.top;
        const offTopOfScreen = entry.boundingClientRect.top <= topOfScreen;

        if (offTopOfScreen && entry.boundingClientRect.top < lowestHeightAboveTop) {
            lowestHeightAboveTop = entry.boundingClientRect.top;
            lowestAboveTop = entry.target as HTMLParagraphElement;
        }
    }

    if (lowestAboveTop) {
        setTopBanner(lowestAboveTop.cloneNode(true) as HTMLParagraphElement);
    }
}, {
    threshold: 0.01,
});

export function StickyText(text: string): Node {
    const p = element("p", { className: "stickytext" },
        text,
        CopyText(text),
    )

    stickyTextVisibilityObserver.observe(p);

    return p;
}

const topBanner = element("header", { id: "topbanner" });
document.body.append(topBanner);
function setTopBanner(elem: HTMLParagraphElement) {
    topBanner.innerHTML = "";
    topBanner.append(elem);
}
