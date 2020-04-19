import * as ts from "typescript";
import { FunctionNode } from "./node-kind";

export type FuncNode = ts.ArrowFunction | ts.FunctionExpression | ts.FunctionDeclaration | ts.MethodDeclaration;

export interface FunctionNodeInfo {
    column: number;
    line: number;
    name: string;
}

export interface FunctionOutput extends FunctionNodeInfo {
    score: number;
    inner: FunctionOutput[];
}

export interface FileOutput {
    score: number;
    inner: FunctionOutput[];
}

export interface ProgramOutput {
    [fileName: string]: FileOutput;
}

export function getFunctionNodeInfo(func: FunctionNode): FunctionNodeInfo {
    const lineAndCol = func.getSourceFile()
        .getLineAndCharacterOfPosition(func.getStart());

    return {
        name: func.getFullText(),
        column: lineAndCol.character,
        line: lineAndCol.line,
    };
}
