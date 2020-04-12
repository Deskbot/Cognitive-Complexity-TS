import * as glob from "glob";
import * as path from "path";
import * as process from "process";
import * as ts from "typescript";
import { getFunctions } from "./get-functions";
import { toPromise } from "./util";
import { OutputFileElem, OutputJson } from "./types";
import { js_beautify } from "js-beautify";

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

function complexity(func: any): number {
    return 1;
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

        const resultForFile = report(file);

        resultForAllFiles[fileName] = resultForFile;
    }

    console.log(js_beautify(JSON.stringify(resultForAllFiles)));
}

function report(file: ts.SourceFile): OutputFileElem {
    const funcToComplexity: [ts.LineAndCharacter, number][] = getFunctions(file)
        .map(func => [
            file.getLineAndCharacterOfPosition(func.getStart()),
            complexity(func)
        ]);

    funcToComplexity
        .map(([name, complexity]) => `${name}\t${complexity}`)
        .join("\n");

    return {} as any;
}
