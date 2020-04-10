import * as cp from "child_process";
import * as fs from "fs";
import glob from "glob";
import * as path from "path";
import tempfile from "tempfile";
import { toPromise } from "../src/util";
import { OutputJson } from "../src/types"
import { diff } from "deep-diff";

const program = path.normalize(__dirname + "/../build/test/main");

function runCase(caseFile: string): Promise<OutputJson> {
    return new Promise((resolve, reject) => {
        const process = cp.spawn("node", [program, caseFile]);
        const outputPath = tempfile();
        const outputStream = fs.createWriteStream(outputPath);
        process.stdout.pipe(outputStream);
        process.on("close", () => {
            // I'm sure getting it into an object could be simpler
            const jsonString =  fs.readFileSync(outputPath).toString();
            try {
                resolve(JSON.parse(jsonString));
            } catch(e) {
                reject(`Fail: Could not parse result of ${caseFile}.`);
            }
        });
    });
}

function allCaseFilePaths(): Promise<string[]> {
    return toPromise(cb => glob(__dirname + "/../../../test/cases/**/*.ts", cb));
}

function getExpectation(testName: string): any {
    const expectedJsonFileContent = fs.readFileSync(testName + ".expected.json").toString();
    return JSON.parse(expectedJsonFileContent);
}

async function main() {
    // get all case names
    const caseFilePaths = await allCaseFilePaths();
    const failedCases = [] as string[];

    // for each case
    for (const fileName of caseFilePaths) {
        const testName = path.parse(fileName).name.split(".")[0];
        console.log("Testing ", testName);
        // run program on case
        // convert output to json
        try {
            var resultObj = await runCase(fileName);
            // read json exected for case
            const expectedObj = getExpectation(testName);
            // deep compare the 2
            const difference = diff(expectedObj, resultObj);
            // output the difference
            // print pass or fail
            if (!difference || difference.length > 0) {
                console.log(difference);
                throw "Fail";
            } else {
                console.log("Pass");
            }
        } catch (err) {
            console.error(err);
            failedCases.push(testName);
            continue;
        }

    }

    // list failures
    if (failedCases.length > 0) {
        console.log(failedCases);
    }
    console.log(caseFilePaths.length - failedCases.length, "passed. Out of ", caseFilePaths.length);
}

main();
