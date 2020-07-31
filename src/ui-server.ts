import * as fs from "fs";
import * as http from "http";
import minimist from "minimist";
import * as path from "path";
import { getFileOrFolderOutput } from "./cognitive-complexity/file-or-folder-output";
import { transferAttributes, nonNaN } from "./util";
import { FileOutput, FolderOutput } from "../shared/types";

const indexFilePath = path.normalize(__dirname + "/../../ui/index.html");

main();

async function main() {
    const args = minimist(process.argv.slice(2));

    if (args["h"] || args["help"]) {
        printHelp();
        return;
    }

    const givenPort = parseInt(args["port"]);
    const port = nonNaN(givenPort, 5678);
    const inputFiles = args["_"];

    const combinedOutputs = {} as FileOutput | FolderOutput;
    for (const file of inputFiles) {
        transferAttributes(combinedOutputs, await getFileOrFolderOutput(file));
    }
    const combinedOutputsJson = JSON.stringify(combinedOutputs);

    const server = http.createServer((req, res) => {
        try {
            if (req.url === "/json") {
                res.write(combinedOutputsJson);
            } else {
                fs.createReadStream(indexFilePath).pipe(res);
            }
            res.statusCode = 200;
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
        }

        res.end();
    });

    server.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`);
    });
}

function printHelp() {
    console.log("Arguments: [-h | --help] [--port <NUMBER>] [FILE]...");
}
