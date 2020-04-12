import * as glob from "glob";
import * as path from "path";
import * as ts from "typescript";
import { getFunctions } from "./get-functions";
import { toPromise } from "./util";

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

    let filePaths: string[] = await toPromise(cb => glob(`${filePath}/**/*`, cb));
    filePaths.push(filePath);
    filePaths = filePaths.filter(path => path.match(/.*\.[tj]sx?$/) !== null);

    console.log(filePaths);

    for (const filePath of filePaths) {
        const file = ts.createSourceFile(
            path.basename(filePath),
            filePath,
            ts.ScriptTarget.ES2017,
            true,
        );

        report(file);
    }
}

function complexity(func): number {
    return 1;
}

function report(file: ts.SourceFile) {
    const funcToComplexity: [ts.LineAndCharacter, number][] = getFunctions(file)
        .map(func => [
            file.getLineAndCharacterOfPosition(func.getStart()),
            complexity(func)
        ]);

    funcToComplexity
        .map(([name, complexity]) => `${name}\t${complexity}`)
        .join("\n")
}
