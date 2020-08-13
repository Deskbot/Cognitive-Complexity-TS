import { addStyleSheet, element } from "../../framework";

addStyleSheet("/css/component/generic/CopyableText");

let copyText: HTMLInputElement;

export function CopyableText(name: string): Node {
    const copyButton = element("button", {
        className: "",
        type: "button"
    });

    const textBox = element("p", {}, [
        name,
        copyButton
    ]);

    copyButton.addEventListener("click", () => {
        if (copyText) {
            copyText.remove();
        }

        copyText = createHiddenCopyText(name);
        document.body.append(copyText);
        copyText.select();
        document.execCommand("copy");
    });

    return textBox;
}

function createHiddenCopyText(text: string): HTMLInputElement {
    return element("input", {
        className: "hidden-offscreen",
        value: text,
    });
}
