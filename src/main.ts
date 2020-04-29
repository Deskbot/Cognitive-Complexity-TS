import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import * as ts from "typescript";
import { ProgramOutput, FileOutput, FolderOutput } from "./types";
import { js_beautify } from "js-beautify";
import { fileCost } from "./cognitive-complexity";

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

    printCognitiveComplexityJson(filePath);
}

function getFileOutput(filePath: string): FileOutput {
    const fileContent = fs.readFileSync(filePath).toString();

    const parsedFile = ts.createSourceFile(
        path.basename(filePath),
        fileContent,
        ts.ScriptTarget.Latest,
        true,
    );

    return fileCost(parsedFile);
}

/**
 * @param entry A file system entry ok unknown type.
 */
// todo can maybe get some speed up by being asynchronous and reading files while building the output
// spawn a bunch of promises and use Promise.all
function getEntryOutput(entryPath: string): FolderOutput | FileOutput {
    const entry = fs.statSync(entryPath);

    if (entry.isDirectory()) {
        const subFiles = fs.readdirSync(entryPath, { withFileTypes: true })
            .filter(filePath => filePath.name.match(/.*\.[tj]sx?$/) !== null);

        const folderOutput: FolderOutput = {};

        for (const file of subFiles) {
            const innerEntryPath = path.join(entryPath, file.name);
            folderOutput[file.name] = getEntryOutput(innerEntryPath);
        }

        return folderOutput;
    } else {
        return getFileOutput(entryPath);
    }
}

function printCognitiveComplexityJson(fullPath: string) {
    const resultForAllFiles: ProgramOutput = {};
    const cwd = process.cwd();

    const filePath = path.relative(cwd, fullPath);
    const fileName = path.parse(fullPath).base;

    resultForAllFiles[fileName] = getEntryOutput(filePath);

    const outputStructure = JSON.stringify(resultForAllFiles, (key, value) => {
        // don't show empty inner
        if (key === "inner" && value.length === 0) {
            return undefined;
        }

        return value;
    });
    console.log(js_beautify(outputStructure));
}
