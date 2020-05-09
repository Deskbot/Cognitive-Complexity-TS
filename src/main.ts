import { promises as fsP } from "fs";
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

async function getFileOutput(filePath: string): Promise<FileOutput> {
    const fileContent = (await fsP.readFile(filePath)).toString();

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
// todo spawn a bunch of promises and use Promise.all
async function getEntryOutput(entryPath: string): Promise<FolderOutput | FileOutput> {
    const entry = await fsP.stat(entryPath);

    if (entry.isDirectory()) {
        const allSubFiles = await fsP.readdir(entryPath, { withFileTypes: true });
        const subFiles = allSubFiles
            .filter(filePath => filePath.name.match(/.*\.[tj]sx?$/) !== null);

        const folderOutput: FolderOutput = {};

        for (const file of subFiles) {
            const innerEntryPath = path.join(entryPath, file.name);
            folderOutput[file.name] = await getEntryOutput(innerEntryPath);
        }

        return folderOutput;
    } else {
        return getFileOutput(entryPath);
    }
}

async function printCognitiveComplexityJson(fullPath: string) {
    const resultForAllFiles: ProgramOutput = {};
    const cwd = process.cwd();

    const filePath = path.relative(cwd, fullPath);
    const fileName = path.parse(fullPath).base;

    resultForAllFiles[fileName] = await getEntryOutput(filePath);

    const outputStructure = JSON.stringify(resultForAllFiles, (key, value) => {
        // don't show empty inner
        if (key === "inner" && value.length === 0) {
            return undefined;
        }

        return value;
    });
    console.log(js_beautify(outputStructure));
}
