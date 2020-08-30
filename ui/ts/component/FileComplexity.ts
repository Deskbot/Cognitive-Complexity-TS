import { FileOutput } from "../../../shared/types";
import { element } from "../framework";
import { ContainerComplexity } from "./ContainerComplexity";
import { StickyTitle } from "./StickyTitle";
import { ToggleableBox } from "./generic/ToggleableBox";

export function FileComplexity(filePath: string, complexity: FileOutput, startOpen: boolean): ToggleableBox {
    return new ToggleableBox([
        StickyTitle(filePath),
        element("p", {}, "Score: " + complexity.score),
    ],
        () => complexity.inner.map(complexity => ContainerComplexity(complexity, filePath)),
        startOpen,
    );
}
