import { FileOutput } from "../../../shared/types";
import { element } from "../framework";
import { ContainerComplexity } from "./ContainerComplexity";
import { CopyText } from "./generic/CopyText";
import { ToggleableBox } from "./generic/ToggleableBox";

export function FileComplexity(filePath: string, complexity: FileOutput, startOpen: boolean): ToggleableBox {
    return new ToggleableBox([
        element("p", {},
            filePath,
            CopyText(filePath),
        ),
        element("p", {}, "Score: " + complexity.score),
    ],
        () => complexity.inner.map(complexity => ContainerComplexity(complexity, filePath)),
        startOpen,
    );
}
