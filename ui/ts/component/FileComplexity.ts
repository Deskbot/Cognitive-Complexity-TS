import { FileOutput } from "../../../shared/types";
import { ContainerComplexity } from "./ContainerComplexity";
import { StickyTitle } from "./StickyTitle";
import { ToggleableBox } from "./generic/ToggleableBox";
import { Score } from "./Score";
import { CopyText } from "./generic/CopyText";

export function FileComplexity(filePath: string, complexity: FileOutput, startOpen: boolean): ToggleableBox {
    return new ToggleableBox([
        StickyTitle([
            filePath,
            CopyText(filePath),
        ]),
        Score(complexity.score),
    ],
        () => complexity.inner.map(complexity => ContainerComplexity(complexity, filePath)),
        startOpen,
    );
}
