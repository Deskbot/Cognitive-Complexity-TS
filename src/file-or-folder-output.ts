/**
 * Functions to apply Cognitive Complexity to files and folders.
 */

import { promises as fsP } from "fs";
import * as path from "path";
import * as ts from "typescript";
import { FileOutput, FolderOutput } from "./types";
import { fileCost } from "./cognitive-complexity";

/**
 * @param entry A file system entry ok unknown type.
 */
export async function getFileOrFolderOutput(entryPath: string): Promise<FileOutput | FolderOutput> {
    const entry = await fsP.stat(entryPath);

    if (entry.isDirectory()) {
        return getFolderOutput(entryPath);
    } else {
        return getFileOutput(entryPath);
    }
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

async function getFolderOutput(folderPath: string) {
    const allSubFiles = await fsP.readdir(folderPath, { withFileTypes: true });
    const subFiles = allSubFiles
        .filter(filePath => filePath.name.match(/.*\.[tj]sx?$/) !== null);

    // promises are used instead of await so that spawned promises don't start after the previous ends
    const folderOutput: FolderOutput = {};
    const folderOutputPromises: Promise<void>[] = []; // all promises used to build folderOutput

    for (const file of subFiles) {
        const innerEntryPath = path.join(folderPath, file.name);

        // once we have the entry data, then add it to the output
        const entryAddedToFolderOutput = getFileOrFolderOutput(innerEntryPath)
            .then(folderEntry => {
                folderOutput[file.name] = folderEntry;
            });
        folderOutputPromises.push(entryAddedToFolderOutput);
    }

    await Promise.all(folderOutputPromises);

    return folderOutput;
}