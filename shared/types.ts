export type NodeKind = "class" | "file" | "function" | "module" | "type"

export interface ColumnAndLine {
    column: number;
    line: number;
}

export interface FunctionNodeInfo extends ColumnAndLine {
    kind: "function";
    name: string;
}

export interface ContainerOutput extends ColumnAndLine {
    kind: "class" | "function" | "module" | "type"
    name: string;
    score: number;
    inner: ContainerOutput[];
}

export interface FileOutput {
    kind: "file",
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
