import * as fs from "fs";
import * as http from "http";
import * as minimist from "minimist";
import * as open from "open";
import * as path from "path";
import { getFileOrFolderOutput } from "./cognitive-complexity/file-or-folder-output";
import { transferAttributes, nonNaN } from "./util";
import { FileOutput, FolderOutput } from "../shared/types";

const sourcePath = path.normalize(__dirname + "/../../ui");
const indexFilePath = sourcePath + "/index.html";

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

    const server = createServer(combinedOutputsJson);
    server.listen(port, () => {
        console.log(`Server started at ${url}`);
        open(url);
    });
}

function createServer(combinedOutputsJson: string): http.Server {
    return http.createServer((req, res) => {
        try {
            if (req.url === "/json") {
                res.setHeader("Content-Type", "text/json");
                res.write(combinedOutputsJson);
            } else {
                const targetFile = sourcePath + (req.url ?? "/");
                if (isPathInsideDir(targetFile, sourcePath)
                    && fs.existsSync(targetFile)
                    && fs.statSync(targetFile).isFile()
                ) {
                    res.write(fs.readFileSync(targetFile));
                } else {
                    res.write(fs.readFileSync(indexFilePath));
                }
            }
            res.statusCode = 200;
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
        }

        res.end();
    });
}

async function generateComplexityJson(inputFiles: string[]): Promise<string> {
    const combinedOutputs = {} as FileOutput | FolderOutput;
    for (const file of inputFiles) {
        transferAttributes(combinedOutputs, await getFileOrFolderOutput(file));
    }

    return JSON.stringify(combinedOutputs);
}

function isPathInsideDir(target: string, base: string): boolean {
    return path.normalize(target).startsWith(base);
}

function printHelp() {
    console.log("Arguments: [-h | --help] [--port <NUMBER>] [FILE]...");
}
