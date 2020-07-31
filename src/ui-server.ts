import * as fs from "fs";
import * as path from "path";
import { stdout } from "process";
import { getFileOrFolderOutput } from "./cognitive-complexity/file-or-folder-output";
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

    stdout.write(fs.readFileSync(htmlDir + "/head.html"));

    stdout.write("<body>");

    stdout.write(fs.readFileSync(htmlDir + "/noscript.html"));

    stdout.write(`
        <script id="cognitive-complexity-ts-json" type="text/json">
            ${JSON.stringify(combinedOutputs)}
        </script>`
    );

    stdout.write("</body>");
    stdout.write("</html>");
}
