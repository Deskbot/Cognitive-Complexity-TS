import * as fs from "fs";
import * as http from "http";
import * as minimist from "minimist";
import * as open from "open";
import * as path from "path";
import { getFileOrFolderOutput } from "./cognitive-complexity/file-or-folder-output";
import { nonNaN, keysToAsyncValues } from "./util";
import { ServerResponse, IncomingMessage } from "http";

const uiSourcePath = __dirname + "/../../ui";
const buildPath = __dirname + "/..";

// it's sad that this is so inconsistent
const cssPath = path.normalize(uiSourcePath + "/ts");
const indexFilePath = path.normalize(uiSourcePath + "/html/index.html");
const jsPath = path.normalize(buildPath + "/ui/ts");
// due to importing "shared" the paths begin with "/ui"
const tsPath = path.normalize(uiSourcePath + "/..");

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

function doesFileExistInFolder(filePath: string, folderPath: string): boolean {
    return isPathInsideDir(filePath, folderPath)
        && fs.existsSync(filePath)
        && fs.statSync(filePath).isFile();
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
    const url = req.url ?? "/";

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

    if (url.startsWith("/js/")) {
        const prefixLength = 4;
        const urlWithoutPrefix = url.substr(prefixLength);

        let targetFile = jsPath + "/" + urlWithoutPrefix;

        if (urlWithoutPrefix.endsWith(".js.map")) {
            res.setHeader("Content-Type", "application/json");
        } else {
            targetFile += ".js";
            res.setHeader("Content-Type", "text/javascript");
        }

        if (!doesFileExistInFolder(targetFile, jsPath)) {
            return endWith404(res);
        }

        res.write(fs.readFileSync(targetFile));
        return;
    }

    if (url.startsWith("/css/")) {
        const prefixLength = 5;
        const urlWithoutPrefix = url.substr(prefixLength);

        const targetFile = cssPath + "/" + urlWithoutPrefix + ".css";

        console.log(urlWithoutPrefix, targetFile, cssPath)

        if (!doesFileExistInFolder(targetFile, cssPath)) {
            return endWith404(res);
        }

        res.setHeader("Content-Type", "text/css");

        res.write(fs.readFileSync(targetFile));
        return;
    }

    if (url.endsWith(".ts")) {
        const targetFile = tsPath + "/" + url;

        if (!doesFileExistInFolder(targetFile, tsPath)) {
            return endWith404(res);
        }

        res.setHeader("Content-Type", "text/x-typescript");

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
