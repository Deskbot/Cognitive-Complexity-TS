import * as ts from "typescript";

export interface ColumnAndLine {
    column: number;
    line: number;
}

export type FuncNode = ts.ArrowFunction | ts.FunctionExpression | ts.FunctionDeclaration | ts.MethodDeclaration;

export interface FunctionNodeInfo extends ColumnAndLine {
    name: string;
}

export interface ContainerOutput extends FunctionNodeInfo {
    score: number;
    inner: ContainerOutput[];
}

export interface FileOutput {
    score: number;
    inner: ContainerOutput[];
}

export type FolderOutput = {
    [name: string]: FileOutput | FolderOutput
};

export interface ProgramOutput {
    [fileName: string]: FileOutput | FolderOutput;
}

export interface ScoreAndInner {
    score: number;
    inner: ContainerOutput[];
}
