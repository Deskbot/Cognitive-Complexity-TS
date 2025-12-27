/**
 * Functions to apply Cognitive Complexity to files and folders.
 */

import { Dirent, promises as fsP } from "fs";
import * as path from "path";
import * as ts from "typescript";
import { FileOutput, FolderOutput, ProgramOutput } from "../../shared/types";
import { createObjectOfPromisedValues } from "../util/util";
import { fileCost } from "./cognitive-complexity";

// API
/**
 * @param entry A file system entry path
 */
export async function getFileOrFolderOutput(entryPath: string): Promise<FileOutput | FolderOutput> {
    const entry = await fsP.stat(entryPath);

    if (entry.isDirectory()) {
        return getFolderOutput(entryPath);
    } else {
        return getFileOutput(entryPath);
    }
}

// API
export async function getFileOutput(filePath: string): Promise<FileOutput> {
    const fileContent = (await fsP.readFile(filePath)).toString();
    return getSourceOutput(fileContent, path.basename(filePath));
}

// API
export function getSourceOutput(sourceCode: string, fileName = ""): FileOutput {
    const parsedFile = ts.createSourceFile(
        fileName,
        sourceCode,
        ts.ScriptTarget.Latest,
        true,
    );

    return fileCost(parsedFile);
}

// API
export async function getFolderOutput(folderPath: string): Promise<FolderOutput> {
    const folderContents = await fsP.readdir(folderPath, { withFileTypes: true });

    return createObjectOfPromisedValues<Dirent, string, FileOutput | FolderOutput>(
        folderContents,
        entry => entry.name,
        (entry) => {
            if (entry.isDirectory()) {
                return getFolderOutput(folderPath + "/" + entry.name);
            }

            // correct extension
            if (entry.name.match(/.*\.[cm]?[tj]sx?$/) !== null) {
                return getFileOutput(folderPath + "/" + entry.name);
            }

            return undefined;
        }
    );
}

// API
/**
 * @param entryPath Relative to cwd
 */
export async function programOutput(entryPath: string): Promise<string> {
    const entryName = path.parse(entryPath).base;

    const resultForAllFiles: ProgramOutput = {
        [entryName]: await getFileOrFolderOutput(entryPath)
    };

    return JSON.stringify(resultForAllFiles, (key, value) => {
        // don't show empty inner
        if (key === "inner" && value.length === 0) {
            return undefined;
        }

        return value;
    });
}
