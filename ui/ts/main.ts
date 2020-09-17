import { ProgramOutput } from "../../shared/types.js";
import { FolderContents } from "./component/tree/FolderContents.js";
import { GlobalControl } from "./component/controls/GlobalControl.js";
import { TreeController } from "./controller/TreeController.js";
import { hasMoreThanOneKey } from "./util.js";

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

    // If there is only one top level node, show it expanded.
    // Otherwise show all nodes minimised by default.
    const onlyOneTopLevelNode = hasMoreThanOneKey(ccResult);

    const controller = new TreeController();
    const topLevelBoxes = new FolderContents(controller, ccResult, onlyOneTopLevelNode);
    controller.register(topLevelBoxes);

    document.body.append(
        GlobalControl("Expand All", () => {
            controller.expandAll();
        }),
        GlobalControl("Collapse All", () => {
            controller.collapseAll();
        }),
        GlobalControl("Sort In Order", () => {
            controller.sortInOrder();
        }),
        GlobalControl("Sort By Complexity", () => {
            controller.sortByComplexity();
        }),
    );

    document.body.append(topLevelBoxes.dom);
}
