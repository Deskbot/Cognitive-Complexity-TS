import { ProgramOutput } from "../../shared/types";
import { CognitiveComplexityUi } from "./component/CognitiveComplexityUi";

main();

function main() {
    /**
     * The Cognitive Complexity result as json text.
     */
    const ccJson = document.getElementById("cognitive-complexity-ts-json")?.innerText;

    if (ccJson === undefined) {
        alert("No Cognitive Complexity result json was undefined.");
        return;
    }

    try {
        var ccResult = JSON.parse(ccJson) as ProgramOutput;
    } catch (e) {
        alert("Could not parse the Cognitive Complexity result json. Check the console for details.");
        console.log("Could not parse:");
        console.log(ccJson);
        return;
    }

    document.body.append(CognitiveComplexityUi(ccResult));
}
