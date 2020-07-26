import { getFileOrFolderOutput } from "../src/file-or-folder-output";
import { transferAttributes } from "../src/util";
import { FileOutput, FolderOutput } from "../src/types";

main();

async function main() {
    const targets = process.argv.slice(2);

    const combinedOutputs = {} as FileOutput | FolderOutput;
    for (const target of targets) {
        transferAttributes(combinedOutputs, await getFileOrFolderOutput(target));
    }
}
