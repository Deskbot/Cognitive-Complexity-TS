import * as fs from "fs";
import * as http from "http";
import * as minimist from "minimist";
import * as open from "open";
import * as path from "path";
import { getFileOrFolderOutput } from "./cognitive-complexity/file-or-folder-output";
import { transferAttributes, nonNaN, keysToAsyncValues } from "./util";
import { ProgramOutput, FileOutput, FolderOutput } from "../shared/types";
import { ServerResponse, IncomingMessage } from "http";

const jsPath = path.normalize(__dirname + "/../ui/ts/");
const indexFilePath = path.normalize(__dirname + "/../../ui/html") + "/index.html";

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
            handleRequest(req, res, combinedOutputsJson);
            res.statusCode = 200;
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
        }

        res.end();
    });
}

function endWith404(res: ServerResponse) {
    res.statusCode = 404;
    res.write("No such endpoint.")
    res.end();
}

async function generateComplexityJson(inputFiles: string[]): Promise<string> {
    const combinedOutputs = await keysToAsyncValues(
        inputFiles,
        file => getFileOrFolderOutput(file)
    );

    return JSON.stringify(combinedOutputs);
}

function handleRequest(req: IncomingMessage, res: ServerResponse, combinedOutputsJson: string) {
    const url = req.url;

    if (url === "/" || url === "index.html") {
        res.setHeader("Content-Type", "text/html");
        res.write(fs.readFileSync(indexFilePath));
        return;
    }

    if (url === "/json") {
        res.setHeader("Content-Type", "text/json");
        res.write(combinedOutputsJson);
        return;
    }

    if (url?.startsWith("/js/")) {
        const prefixLength = 4;
        const urlWithoutPrefix = url.substr(prefixLength);

        const targetFile = jsPath + "/" + urlWithoutPrefix + ".js";

        if (!isPathInsideDir(targetFile, jsPath)
            || !fs.existsSync(targetFile)
            || !fs.statSync(targetFile).isFile()
        ) {
            return endWith404(res);
        }

        res.setHeader("Content-Type", "text/javascript");

        res.write(fs.readFileSync(targetFile));
        return;
    }

    return endWith404(res);
}

function isPathInsideDir(target: string, base: string): boolean {
    return path.normalize(target).startsWith(base);
}

function printHelp() {
    console.log("Arguments: [-h | --help] [--port <NUMBER>] [FILE]...");
}
