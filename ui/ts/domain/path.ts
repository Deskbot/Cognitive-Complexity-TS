export function concatFilePath(basePath: string, entry: string):string {
    return basePath === "" ? entry : basePath + "/" + entry;
}
