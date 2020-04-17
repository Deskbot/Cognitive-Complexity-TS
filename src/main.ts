import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import * as process from "process";
import * as ts from "typescript";
import { toPromise } from "./util";
import { OutputJson } from "./types";
import { js_beautify } from "js-beautify";
import { calcFileCost } from "./cognitive-complexity";
import { debug } from "util";
import { mainDebug, debugNode } from "./debug";

main();

async function main() {
    const args = process.argv.slice(2);
    console.log(args);

    try {
        var filePath = args[0][0] === "/"
            ? args[0]
            : process.cwd() + "/" + args[0];

    } catch (ignore) {
        throw new Error("Usage: arg1: target file path");
    }

    let filePaths: string[] = await toPromise(cb => glob(`${filePath}/**/*`, cb));
    filePaths.push(filePath);
    console.log(filePaths);
    filePaths = filePaths.filter(path => path.match(/.*\.[tj]sx?$/) !== null);
    console.log(filePaths);
    printCognitiveComplexityJson(filePaths);
}

function printCognitiveComplexityJson(filePaths: string[]) {
    const resultForAllFiles: OutputJson = {};
    const cwd = process.cwd();

    console.log(filePaths);

    for (const filePath of filePaths) {
        const fileName = path.relative(cwd, filePath);
        const fileContent = fs.readFileSync(filePath).toString();

        const file = ts.createSourceFile(
            path.basename(filePath),
            fileContent,
            ts.ScriptTarget.Latest,
            true,
        );

        mainDebug(fileName);
        const resultForFile = calcFileCost(file);

        mainDebug(JSON.stringify(resultForFile));
        resultForAllFiles[fileName] = resultForFile;
    }

    console.log(js_beautify(JSON.stringify(resultForAllFiles)));
}
