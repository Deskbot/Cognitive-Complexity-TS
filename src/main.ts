import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";
import * as process from "process";
import * as ts from "typescript";
import { toPromise } from "./util";
import { OutputJson } from "./types";
import { js_beautify } from "js-beautify";
import { calcFileCost } from "./cognitive-complexity";

main();

async function main() {
    const args = process.argv.slice(2);

    try {
        var filePath = args[0][0] === "/"
            ? args[0]
            : process.cwd() + "/" + args[0];

    } catch (ignore) {
        throw new Error("Usage: arg1: target file path");
    }

    let filePaths: string[] = await toPromise(cb => glob(`${filePath}/**/*`, cb));
    filePaths.push(filePath);
    filePaths = filePaths.filter(path => path.match(/.*\.[tj]sx?$/) !== null);
    printCognitiveComplexityJson(filePaths);
}

function printCognitiveComplexityJson(filePaths: string[]) {
    const resultForAllFiles: OutputJson = {};
    const cwd = process.cwd();

    for (const filePath of filePaths) {
        const fileName = path.relative(cwd, filePath);
        const fileContent = fs.readFileSync(filePath).toString();

        const file = ts.createSourceFile(
            path.basename(filePath),
            fileContent,
            ts.ScriptTarget.Latest,
            true,
        );

        console.error(fileName, "poo"); // todo use debug func
        const resultForFile = calcFileCost(file);

        console.error(JSON.stringify(resultForFile));
        resultForAllFiles[fileName] = resultForFile;
    }

    console.log(js_beautify(JSON.stringify(resultForAllFiles)));
}
