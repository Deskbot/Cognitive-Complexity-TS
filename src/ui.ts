import * as minimist from "minimist";
import * as open from "open";
import { nonNaN, keysToAsyncValues } from "./util/util";
import { getFileOrFolderOutput } from "./cognitive-complexity/output";
import { createUiServer } from "./ui-server/ui-server";

main();

async function main() {
    const args = minimist(process.argv.slice(2));

    if (args["h"] || args["help"]) {
        printHelp();
        return;
    }

    const givenPort = parseInt(args["port"]);
    const port = nonNaN(givenPort, 5678);
    const url = `http://localhost:${port}`;

    const inputFiles = args["_"];
    const combinedOutputsJson = await generateComplexityJson(inputFiles);

    const server = createUiServer(combinedOutputsJson);
    server.listen(port, () => {
        console.log(`Server started at ${url}`);
        open(url);
    });
}

async function generateComplexityJson(inputFiles: string[]): Promise<string> {
    const combinedOutputs = await keysToAsyncValues(
        inputFiles,
        file => getFileOrFolderOutput(file)
    );

    return JSON.stringify(combinedOutputs);
}

function printHelp() {
    console.log("Arguments: [-h | --help] [--port <NUMBER>] [FILE]...");
}
