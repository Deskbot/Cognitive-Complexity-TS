import { ProgramOutput } from "../../shared/types.js";
import { Main } from "./component/Main.js";

main();

async function main() {
    const result = await fetch("/json");

    /**
     * The Cognitive Complexity result as json text.
     */
    try {
        var ccJson = await result.text();
    } catch (e) {
        alert("Could not fetch json by url.");
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

    document.body.append(Main(ccResult));
}
