import * as ts from "typescript";

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
