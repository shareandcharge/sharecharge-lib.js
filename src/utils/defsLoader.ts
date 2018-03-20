import * as fs from "fs";
import * as path from "path";

export const loadContractDefs = (stage): any => {

    let defs = null;

    let globalPath = process.env["HOME"] + `/.sharecharge/contract.defs.${stage}.json`;

    console.log("global", globalPath);

    if (fs.existsSync(globalPath)) {
        defs = JSON.parse(fs.readFileSync(globalPath, "utf8"));
    }

    if (!defs) {

        const localPath = path.join(__dirname, `../../node_modules/sharecharge-contracts/contract.defs.${stage}.json`);

        console.log("local", localPath);

        if (fs.existsSync(localPath)) {
            defs = JSON.parse(fs.readFileSync(localPath, "utf8"));
        }
    }

    return defs;
};
