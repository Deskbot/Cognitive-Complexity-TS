import ts from "typescript";

export interface ColumnAndLine {
    column: number;
    line: number;
}

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
    [name: string]: FileOutput | FolderOutput;
};

export type ProgramOutput = FolderOutput;

export interface ScoreAndInner {
    score: number;
    inner: ContainerOutput[];
}

export interface TraversalContext {
    scoreAndInner: ScoreAndInner;
    precedingOperator: ts.BinaryOperatorToken | undefined;
}