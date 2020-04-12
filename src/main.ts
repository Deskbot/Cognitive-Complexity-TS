import * as glob from "glob";
import * as path from "path";
import * as process from "process";
import * as ts from "typescript";
import { getFunctions } from "./get-functions";
import { toPromise } from "./util";
import { OutputFileElem, OutputJson } from "./types";
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

    console.log(filePaths);

    printCognitiveComplexityJson(filePaths);
}

function printCognitiveComplexityJson(filePaths: string[]) {
    const resultForAllFiles: OutputJson = {};

    for (const filePath of filePaths) {
        const fileName = path.relative(process.cwd(), filePath);

        const file = ts.createSourceFile(
            fileName,
            filePath,
            ts.ScriptTarget.Latest,
            true,
        );

        const resultForFile = calcFileCost(file);

        resultForAllFiles[fileName] = resultForFile;
    }

    console.log(js_beautify(JSON.stringify(resultForAllFiles)));
}
