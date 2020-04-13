import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

let text = false;

main();

function main() {
    const args = process.argv.slice(2);

    try {
        var filePath = args[0][0] === "/"
            ? args[0]
            : process.cwd() + "/" + args[0];

    } catch (ignore) {
        throw new Error("Usage: arg1: target file path, arg2: target class name");
    }

    for (const arg of args.slice(2)) {
        if (arg === "text") {
            text = true;
        }
    }

    const file = ts.createSourceFile(
        path.basename(filePath),
        fs.readFileSync(filePath).toString(),
        ts.ScriptTarget.ES2017,
        true,
    );

    report(file);
}

function repeat(str: string, times: number): string {
    let res = "";
    for (let i = 0; i < times; i++) {
        res += str;
    }

    return res;
}

function report(node: ts.Node, depth: number = 0) {
    const toLog = [repeat("\t", depth), ts.SyntaxKind[node.kind], node.kind];
    if (text) {
        toLog.push(node.getText());
    }

    console.log(...toLog);

    for (const child of node.getChildren()) {
        report(child, depth + 1);
    }
}
