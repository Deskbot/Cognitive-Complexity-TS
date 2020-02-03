import * as path from "path";
import * as ts from "typescript";

type FuncNode = ts.ArrowFunction | ts.FunctionExpression | ts.FunctionDeclaration

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

    const file = ts.createSourceFile(
        path.basename(filePath),
        filePath,
        ts.ScriptTarget.ES2017,
        true,
    );

    report(file);
}

function complexity(func): number {

}

function getFunctions(node: ts.Node): FuncNode[] {
    if (ts.isFunctionDeclaration(node)) {

        const blockNode = node.getChildren().filter(funcNode => ts.isBlock(funcNode))[0];

        if (blockNode === undefined) return [node];

        return [node, ...getFunctions(blockNode)];

    } else if (node.getChildren().length > 0) {

    }

    return [];
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