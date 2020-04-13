import * as cp from "child_process";
import * as fs from "fs";
import glob from "glob";
import * as path from "path";
import tempfile from "tempfile";
import { toPromise } from "../src/util";
import { OutputJson } from "../src/types"
import { diff } from "deep-diff";

const casesDir = path.normalize(__dirname + "/../../../test/cases");
const program = path.normalize(__dirname + "/../../src/main");

function runCase(caseName: string, outputPath: string): Promise<OutputJson> {
    return new Promise((resolve, reject) => {
        const process = cp.spawn("node", [program, caseName + ".ts"]);
        const outputStream = fs.createWriteStream(outputPath);
        process.stdout.pipe(outputStream);
        process.on("close", () => {
            // I'm sure getting it into an object could be simpler
            const jsonString =  fs.readFileSync(outputPath).toString();
            try {
                resolve(JSON.parse(jsonString));
            } catch(e) {
                reject(`Fail: Could not parse result of ${caseName}. (${outputPath})`);
            }
        });
    });
}

function allCaseFilePaths(): Promise<string[]> {
    return toPromise(cb => glob(`${casesDir}/**/*.ts`, cb));
}

function getExpectation(fileName: string): any {
    const extensionIndex = fileName.lastIndexOf(".ts");
    const caseExpectationFile = fileName.substr(0, extensionIndex) + ".expected.json";
    console.log(caseExpectationFile);
    const expectedJsonFileContent = fs.readFileSync(caseExpectationFile).toString();
    return JSON.parse(expectedJsonFileContent);
}

async function main() {
    // get all case names
    const caseFilePaths = await allCaseFilePaths();
    const failedCases = [] as string[];

    // for each case
    for (const fileName of caseFilePaths) {
        const testName = path.parse(fileName).name.split(".")[0];
        console.log("Testing", testName);

        // run program on case
        // convert output to json
        const outputPath = tempfile();
        try {
            const resultObj = await runCase(testName, outputPath);
            // read json exected for case
            const expectedObj = getExpectation(fileName);
            // deep compare the 2
            const difference = diff(expectedObj, resultObj);
            // output the difference
            // print pass or fail
            if (difference && difference.length > 0) {
                throw difference;
            } else {
                console.log("Pass");
            }
        } catch (err) {
            console.error(outputPath);
            console.error("Fail");
            console.error(err);
            console.trace();
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
