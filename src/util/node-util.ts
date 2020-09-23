import ts from "typescript";
import { Unreachable } from "./util";

function nodeLocation(node: ts.Node) {
    const sourceFile = node.getSourceFile();
    const lineAndCol = sourceFile
        .getLineAndCharacterOfPosition(node.getStart());

    return `${sourceFile.fileName}:${lineAndCol.line}:${lineAndCol.character}`;
}

export class UnreachableNodeState extends Unreachable {
    constructor(node: ts.Node, reason: string) {
        super(`${reason}\nAt: ${nodeLocation(node)}`);
    }
}
