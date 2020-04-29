import * as ts from "typescript";

export interface ColumnAndLine {
    column: number;
    line: number;
}

export type FuncNode = ts.ArrowFunction | ts.FunctionExpression | ts.FunctionDeclaration | ts.MethodDeclaration;

export interface FunctionNodeInfo extends ColumnAndLine {
    name: string;
}

// TODO rename this because it includes classes and namespaces
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

export interface ScoreAndInner {
    score: number;
    inner: FunctionOutput[];
}
