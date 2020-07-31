import * as fs from "fs";
import * as http from "http";
import * as path from "path";
import { getFileOrFolderOutput } from "./cognitive-complexity/file-or-folder-output";
import { transferAttributes } from "./util";
import { FileOutput, FolderOutput } from "./types";

const indexFilePath = path.normalize(__dirname + "/../../ui/front/index.html");

main();

async function main() {
    const targets = process.argv.slice(2);

    const combinedOutputs = {} as FileOutput | FolderOutput;
    for (const target of targets) {
        transferAttributes(combinedOutputs, await getFileOrFolderOutput(target));
    }
    const combinedOutputsJson = JSON.stringify(combinedOutputs);

    const server = http.createServer((req, res) => {
        try {
            if (req.url === "/json") {
                res.write(combinedOutputsJson);
            } else {
                fs.createReadStream(indexFilePath).pipe(res);
            }
            res.statusCode = 200;
        } catch (e) {
            console.error(e);
            res.statusCode = 500;
        }

        res.end();
    });

    server.listen(5678, () => {
        console.log("Server started at localhost:5678");
    });
}
