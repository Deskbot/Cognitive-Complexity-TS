import { ContainerOutput } from "../../../shared/types";
import { element } from "../framework";
import { CopyText } from "./generic/CopyText";
import { ToggleableBox } from "./generic/ToggleableBox";
import { Score } from "./Score";

export function ContainerComplexity(complexity: ContainerOutput, filePath: string): ToggleableBox {
    return new ToggleableBox([
        element("p", {},
            complexity.name,
            CopyText(`${filePath}:${complexity.line}:${complexity.column}`),
        ),
        Score(complexity.score),
    ],
        () => complexity.inner.map(complexity => ContainerComplexity(complexity, filePath)),
        false,
    );
}
