import { FileOutput } from "../../../shared/types";
import { element } from "../framework";
import { ContainerComplexity } from "./ContainerComplexity";
import { CopyButton } from "./generic/CopyableText";
import { ToggleableBox } from "./generic/ToggleableBox";

export function FileComplexity(filePath: string, complexity: FileOutput, startOpen: boolean): Node {
    return ToggleableBox([
        element("p", {}, [
            filePath,
            CopyButton(filePath),
        ]),
        element("p", {}, ["score: " + complexity.score]),
    ],
        complexity.inner.map(ContainerComplexity),
        startOpen,
    );
}
