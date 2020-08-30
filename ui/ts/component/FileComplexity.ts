import { FileOutput } from "../../../shared/types";
import { element } from "../framework";
import { ContainerComplexity } from "./ContainerComplexity";
import { StickyText } from "./generic/StickyText";
import { ToggleableBox } from "./generic/ToggleableBox";

export function FileComplexity(filePath: string, complexity: FileOutput, startOpen: boolean): ToggleableBox {
    return new ToggleableBox([
        StickyText(filePath),
        element("p", {}, "Score: " + complexity.score),
    ],
        () => complexity.inner.map(complexity => ContainerComplexity(complexity, filePath)),
        startOpen,
    );
}
