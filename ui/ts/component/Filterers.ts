import { ComplexityController, Include } from "../complexity-tree/ComplexityController.js";
import { ToggleControl } from "./controls/ToggleControl.js";

export function Filterers(controller: ComplexityController) {
    function updateFilter() {
        if (includeFolders.getState()) {
            controller.setInclude(Include.folders);
        } else if (includeFiles.getState()) {
            controller.setInclude(Include.files);
        } else {
            controller.setInclude(Include.containers);
        }
    }

    const includeFolders = new ToggleControl(true, "Include Folders", (state) => {
        // folders implies files
        if (state) {
            includeFiles.setState(true);
        }

        updateFilter();
    });

    const includeFiles = new ToggleControl(true, "Include Files", (state) => {
        // no files implies no folders
        if (!state) {
            includeFolders.setState(false);
        }

        updateFilter();
    });

    return [
        includeFolders.dom,
        includeFiles.dom,
    ];
}