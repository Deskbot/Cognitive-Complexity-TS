/**
 * Functions to apply Cognitive Complexity to files and folders.
 */

import { promises as fsP } from "fs";
import * as path from "path";
import * as ts from "typescript";
import { FileOutput, FolderOutput } from "../../shared/types";
import { fileCost } from "./cognitive-complexity";
import { keysToAsyncValues } from "../util";

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

async function getFolderOutput(folderPath: string): Promise<FolderOutput> {
    const allSubFiles = await fsP.readdir(folderPath, { withFileTypes: true });
    const subFiles = allSubFiles
        .filter(filePath => filePath.name.match(/.*\.[tj]sx?$/) !== null);

    const subFilePaths = subFiles.map(file => path.join(folderPath, file.name));

    const folderOutput = keysToAsyncValues(
        subFilePaths,
        innerEntryPath => getFileOrFolderOutput(innerEntryPath)
    );

    return folderOutput;
}