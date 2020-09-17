import { promises as fsP } from "fs";
import * as http from "http";
import * as path from "path";
import { ServerResponse, IncomingMessage } from "http";
import { doesNotThrow } from "../util";

const buildUiPath = __dirname + "/../../../build-ui";

const cssPath = path.normalize(buildUiPath + "/css");
const indexFilePath = path.normalize(buildUiPath + "/index.html");
const jsPath = path.normalize(buildUiPath + "/js");
const tsPath = path.normalize(buildUiPath + "/ts");

export function createUiServer(combinedOutputsJson: string): http.Server {
    return http.createServer(async (req, res) => {
        try {
            await handleRequest(req, res, combinedOutputsJson);
            res.statusCode = 200;
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
        }

        res.end();
    });
}

async function doesFileExistInFolder(filePath: string, folderPath: string): Promise<boolean> {
    return isPathInsideDir(filePath, folderPath)
        && await doesNotThrow(fsP.access(filePath))
        && (await fsP.stat(filePath)).isFile();
}

function endWith404(res: ServerResponse) {
    res.statusCode = 404;
    res.write("No such endpoint.")
    res.end();
}

async function handleRequest(req: IncomingMessage, res: ServerResponse, combinedOutputsJson: string) {
    const url = req.url ?? "/";

    if (url === "/" || url === "/index.html") {
        res.setHeader("Content-Type", "text/html");
        res.write(await fsP.readFile(indexFilePath));
        return;
    }

    if (url === "/json") {
        res.setHeader("Content-Type", "text/json");
        res.write(combinedOutputsJson);
        return;
    }

    if (url.endsWith(".css")) {
        const targetFile = cssPath + "/" + url;

        if (!doesFileExistInFolder(targetFile, cssPath)) {
            return endWith404(res);
        }

        res.setHeader("Content-Type", "text/css");
        res.write(await fsP.readFile(targetFile));
        return;
    }

    if (url.endsWith(".js")) {
        const targetFile = jsPath + "/" + url;

        if (!doesFileExistInFolder(targetFile, jsPath)) {
            return endWith404(res);
        }

        res.setHeader("Content-Type", "text/javascript");
        res.write(await fsP.readFile(targetFile));
        return;
    }

    if (url.endsWith(".js.map")) {
        const targetFile = jsPath + "/" + url;

        if (!doesFileExistInFolder(targetFile, jsPath)) {
            return endWith404(res);
        }

        res.setHeader("Content-Type", "application/json");
        res.write(await fsP.readFile(targetFile));
        return;
    }

    if (url.endsWith(".ts")) {
        const targetFile = tsPath + "/" + url;

        if (!doesFileExistInFolder(targetFile, tsPath)) {
            return endWith404(res);
        }

        res.setHeader("Content-Type", "text/x-typescript");
        res.write(await fsP.readFile(targetFile));
        return;
    }

    return endWith404(res);
}

function isPathInsideDir(target: string, base: string): boolean {
    return path.normalize(target).startsWith(base);
}
