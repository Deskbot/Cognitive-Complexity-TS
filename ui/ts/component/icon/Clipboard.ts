import { addStyleSheet, element } from "../../framework";

addStyleSheet(import.meta.url);

const svgTemplate = element("template", {});
svgTemplate.innerHTML =
    `<svg class="clipboard-icon" xmlns="http://www.w3.org/2000/svg" viewBox="1.5 1 21 21" width="24" height="24" >
        <path d="M7 4V2h10v2h3.007c.548 0 .993.445.993.993v16.014a.994.994 0 0 1-.993.993H3.993A.994.994 0 0 1 3 21.007V4.993C3 4.445 3.445 4 3.993 4H7zm0 2H5v14h14V6h-2v2H7V6zm2-2v2h6V4H9z" />
    </svg>`;

export function ClipboardSvg() {
    return svgTemplate.content.cloneNode(true);
}
