import * as fs from "fs";
import * as path from "path";

export const loadContractDefs = (stage) => {

    const localPath = path.join(__dirname, `../../node_modules/sharecharge-contracts/contract.defs.${stage}.json`);

    console.log(localPath);

    if (fs.existsSync(localPath)) {
        return JSON.parse(fs.readFileSync(localPath, "utf8"));
    }

    let globalPath = process.env["HOME"] + `/.sharecharge/contract.defs.${stage}.json`;

    if (fs.existsSync(globalPath)) {
        return JSON.parse(fs.readFileSync(globalPath, "utf8"));
    }

    globalPath = process.env["HOME"] + `/.sharecharge/contract.defs.development.json`;

    if (fs.existsSync(globalPath)) {
        return JSON.parse(fs.readFileSync(globalPath, "utf8"));
    }

    return null;
};
