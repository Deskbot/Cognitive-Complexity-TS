import { FileOutput } from "../../../shared/types";
import { element } from "../framework";
import { ContainerComplexity } from "./ContainerComplexity";
import { ToggleableBox } from "./generic/ToggleableBox";

export function FileComplexity(filePath: string, complexity: FileOutput, startOpen: boolean): Node {
    return ToggleableBox([
        element("p", {}, [filePath]),
        element("p", {}, ["score: " + complexity.score]),
    ],
        complexity.inner.map(ContainerComplexity),
        startOpen,
    );
}
