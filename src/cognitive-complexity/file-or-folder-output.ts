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
    const folderContents = await fsP.readdir(folderPath, { withFileTypes: true });
    const subEntries = folderContents
        .filter((entryPath) => {
            const correctExtension = entryPath.name.match(/.*\.[tj]sx?$/) !== null;
            const isDir = entryPath.isDirectory();
            return correctExtension || isDir;
        });

    const subFilePaths = subEntries.map(file => path.join(folderPath, file.name));

    const folderOutput = keysToAsyncValues(
        subFilePaths,
        // TODO: call the correct func based on the information gained above
        innerEntryPath => getFileOrFolderOutput(innerEntryPath)
    );

    return folderOutput;
}
