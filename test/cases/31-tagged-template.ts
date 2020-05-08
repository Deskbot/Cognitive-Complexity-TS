function noRecursion(arr: TemplateStringsArray, arg: string): string {
    return recursion`${"str"}`;
}

function recursion(arr: TemplateStringsArray, arg: string): string {
    return recursion`${"str"}`;
}
