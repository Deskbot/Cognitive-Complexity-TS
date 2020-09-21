import * as path from "path";
import * as process from "process";
import { js_beautify } from "js-beautify";
import { programOutput } from "./cognitive-complexity/output";

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

    await printCognitiveComplexityJson(filePath);
}

async function printCognitiveComplexityJson(fullPath: string) {
    const relativePath = path.relative(process.cwd(), fullPath);

    const programOutputStr = await programOutput(relativePath);

    console.log(js_beautify(programOutputStr));
}
