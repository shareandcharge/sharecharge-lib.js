import * as crypto from 'crypto';
import * as fs from "fs";
import * as path from "path";

const web3Utils = require('web3').utils;

export class ToolKit {

    static randomBytes32String(): string {
        return '0x' + crypto.randomBytes(32).toString('hex');
    }

    static hexToString(val: string): string {
        return web3Utils.hexToString(val);
    }

    static isAddress(val: string): boolean {
        return web3Utils.isAddress(val);
    }

    static asciiToHex(val: string): string {
        return web3Utils.asciiToHex(val);
    }

    static contractDefsForStage(stage: string, verbose: boolean = false) {
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
    }
}