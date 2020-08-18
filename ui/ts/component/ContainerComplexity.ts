import { ContainerOutput } from "../../../shared/types";
import { element } from "../framework";
import { CopyButton } from "./generic/CopyableText";
import { ToggleableBox } from "./generic/ToggleableBox";

export function ContainerComplexity(complexity: ContainerOutput, filePath: string): Node {
    return ToggleableBox([
        element("p", {},
            [`${complexity.name} Line ${complexity.line}, Column ${complexity.column}`]
        ),
        CopyButton(`${filePath}:${complexity.line}:${complexity.column}`),
        element("p", {},
            [`Score: ${complexity.score}`]
        ),
    ],
        complexity.inner.map(complexity => ContainerComplexity(complexity, filePath)),
        false,
    );
}
