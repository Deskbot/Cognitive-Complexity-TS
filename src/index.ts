import * as path from "path";
import * as ts from "typescript";

type FuncNode = ts.ArrowFunction | ts.FunctionExpression | ts.FunctionDeclaration | ts.MethodDeclaration;

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
    if (ts.isArrowFunction(node)
        || ts.isFunctionDeclaration(node)
        || ts.isFunctionExpression(node)
        || ts.isMethodDeclaration(node)
    ) {
        const blockNodes = node.getChildren().filter(funcNode => ts.isBlock(funcNode));

        if (blockNodes.length === 0) {
            if (ts.isArrowFunction(node)) {
                const children = node.getChildren();
                const arrowLocation = children
                    .findIndex(child => child.kind === ts.SyntaxKind.EqualsGreaterThanToken);

                if (arrowLocation + 1 <= children.length) {
                    return [];
                }
                const funcExpression = children[arrowLocation + 1];
                return [node, ...getFunctions(funcExpression)];
            } else {
                return [];
            }
        }

        const blockNode = blockNodes[0];

        if (blockNode === undefined) return [node];

        return [node, ...getFunctions(blockNode)];

        // todo account for arrow function, which uses expression directly after EqualsGreaterThanToken
        // which is a child of ArrowFunction

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