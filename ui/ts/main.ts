import { ProgramOutput } from "../../shared/types";
import { CognitiveComplexityUi } from "./component/CognitiveComplexityUi";
import { CollapseAll, ExpandAll } from "./component/global-controls";
import { hasMoreThanOneKey } from "./util";

main();

async function main() {
    const result = await fetch("/json");

    /**
     * The Cognitive Complexity result as json text.
     */
    const ccJson = await result.text();

    try {
        var ccResult = JSON.parse(ccJson) as ProgramOutput;
    } catch (e) {
        alert("Could not parse the Cognitive Complexity result json. Check the console for details.");
        console.log("Could not parse:");
        console.log(ccJson);
        return;
    }

    // If there is only one top level node, show it expanded.
    // Otherwise show all nodes minimised by default.
    const onlyOneTopLevelNode = hasMoreThanOneKey(ccResult);

    document.body.append(
        ExpandAll(),
        CollapseAll(),
    );

    CognitiveComplexityUi(ccResult, onlyOneTopLevelNode)
        .forEach((complexityUi) => {
            document.body.append(complexityUi.dom);
        });
}
