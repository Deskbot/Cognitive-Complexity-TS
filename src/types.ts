import * as ts from "typescript";

export type FuncNode = ts.ArrowFunction | ts.FunctionExpression | ts.FunctionDeclaration | ts.MethodDeclaration;


export interface OutputElem {
    name: string;
    score: number;
    line: number;
    column: number;
    inner?: OutputElem[];
}

export interface OutputFileElem {
    score: number;
    inner: OutputElem[];
}

export interface OutputJson {
    [fileName: string]: OutputFileElem;
}
