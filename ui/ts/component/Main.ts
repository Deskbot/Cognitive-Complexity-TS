import { ProgramOutput } from "../../../shared/types";
import { DataController, Include } from "../controller/DataController.js";
import { TreeController } from "../controller/TreeController.js";
import { element } from "../framework.js";
import { GlobalControl } from "./controls/GlobalControl.js";
import { GlobalToggleControl } from "./controls/GlobalToggleControl.js";

export function Main(complexity: ProgramOutput) {
    const treeController = new TreeController();
    const dataController = new DataController(complexity, treeController);

    function updateFilter() {
        if (includeFolders.getState()) {
            dataController.setInclude(Include.folders);
        } else if (includeFiles.getState()) {
            dataController.setInclude(Include.files);
        } else {
            dataController.setInclude(Include.containers);
        }
    }

    const includeFolders = new GlobalToggleControl(true, "Include Folders", (state) => {
        // folders implies files
        if (state) {
            includeFiles.setState(true);
        }

        updateFilter();
    });

    const includeFiles = new GlobalToggleControl(true, "Include Files", (state) => {
        // no files implies no folders
        if (!state) {
            includeFolders.setState(false);
        }

        updateFilter();
    });

    return element("main", {},
        GlobalControl("Expand All", () => {
            treeController.expandAll();
        }),
        GlobalControl("Collapse All", () => {
            treeController.collapseAll();
        }),
        GlobalControl("Sort In Order", () => {
            dataController.sortInOrder();
        }),
        GlobalControl("Sort By Complexity", () => {
            dataController.sortByComplexity();
        }),
        includeFolders.dom,
        includeFiles.dom,

        dataController.dom
    );
}
