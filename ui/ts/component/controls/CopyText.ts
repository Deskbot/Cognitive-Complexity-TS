import { addStyleSheet, element } from "../../framework";
import { ClipboardSvg } from "../icon/Clipboard";

addStyleSheet(import.meta.url);

class HiddenCopyText {
    private readonly copyText = element("input", {
        className: "hidden-off-screen"
    });

    private constructor() {
        document.body.append(this.copyText);
    }

    copy(text: string) {
        this.copyText.value = text;
        this.copyText.select();
        document.execCommand("copy");
    }

    static getInstance(): HiddenCopyText {
        // We don't want to generate this element at page load because it's visible before CSS gets loaded.
        const instance = new HiddenCopyText();
        HiddenCopyText.getInstance = () => instance;
        return instance;
    };
}

export function CopyText(text: string): Node {
    const copyButton = element("button", {
        className: "copytext-button",
        title: "copy",
        type: "button"
    },
        ClipboardSvg()
    );

    copyButton.addEventListener("click", () => {
        HiddenCopyText.getInstance().copy(text);
    });

    return copyButton;
}
