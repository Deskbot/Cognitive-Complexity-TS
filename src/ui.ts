import * as fs from "fs";
import * as path from "path";
import { stdout } from "process";
import { getFileOrFolderOutput } from "./file-or-folder-output";
import { transferAttributes } from "./util";
import { FileOutput, FolderOutput } from "./types";

const htmlDir = path.normalize(__dirname + "/../../ui/html");

main();

async function main() {
    const targets = process.argv.slice(2);

    const combinedOutputs = {} as FileOutput | FolderOutput;
    for (const target of targets) {
        transferAttributes(combinedOutputs, await getFileOrFolderOutput(target));
    }

    // The page structure is very simple and so the following code.
    // Although I admit that it feels bad.
    stdout.write("<!DOCTYPE html>");
    stdout.write("<html>");

    fs.createReadStream(htmlDir + "/head.html").pipe(stdout);

    stdout.write("<body>");

    fs.createReadStream(htmlDir + "/noscript.html").pipe(stdout);
    stdout.write(`
        <script id="cognitive-complexity-ts-json" type="text/json">
            ${JSON.stringify(combinedOutputs)}
        </script>`
    );

    stdout.write("</body>");
    stdout.write("</html>");
}
