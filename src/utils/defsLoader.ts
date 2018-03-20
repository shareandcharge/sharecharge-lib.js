import * as fs from "fs";
import * as path from "path";

export const loadContractDefs = (stage: string, verbose: boolean = false): any => {

    let defs;

    const globalPath = process.env["HOME"] + `/.sharecharge/contract.defs.${stage}.json`;

    if (verbose) {
        console.log("global", globalPath);
    }

    if (fs.existsSync(globalPath)) {
        defs = JSON.parse(fs.readFileSync(globalPath, "utf8"));
    }

    if (!defs) {

        const localPath = path.join(__dirname, `../../node_modules/sharecharge-contracts/contract.defs.${stage}.json`);

        if (verbose) {
            console.log("local", localPath);
        }

        if (fs.existsSync(localPath)) {
            defs = JSON.parse(fs.readFileSync(localPath, "utf8"));
        }
    }

    return defs;
};
