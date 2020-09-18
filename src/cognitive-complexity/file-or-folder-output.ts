/**
 * Functions to apply Cognitive Complexity to files and folders.
 */

import { Dirent, promises as fsP } from "fs";
import * as path from "path";
import * as ts from "typescript";
import { FileOutput, FolderOutput } from "../../shared/types";
import { createObjectOfPromisedValues } from "../util";
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

async function getFolderOutput(folderPath: string): Promise<FolderOutput> {
    const folderContents = await fsP.readdir(folderPath, { withFileTypes: true });

    return createObjectOfPromisedValues<Dirent, string, FileOutput | FolderOutput>(
        folderContents,
        entry => entry.name,
        (entry) => {
            if (entry.isDirectory()) {
                return getFolderOutput(folderPath + "/" + entry.name);
            }

            // correct extension
            if (entry.name.match(/.*\.[tj]sx?$/) !== null) {
                return getFileOutput(folderPath + "/" + entry.name);
            }

            return undefined;
        }
    );
}
