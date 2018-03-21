const web3Utils = require('web3').utils;
import * as crypto from 'crypto';
import * as fs from "fs";
import * as path from "path";
import { PlugType } from '../models/plugType';

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

    static toPlugMask(plugTypes: PlugType[]): number {
        let mask = 0;
        for (let i = 0; i < plugTypes.length; i++) {
            mask |= plugTypes[i];
        }
        return mask;
    }

    static fromPlugMask(mask: number): PlugType[] {
        const plugs: PlugType[] = [];
        for (let bit = 0; bit < 16; bit++) {
            const flag = (mask >> bit) & 0x01;
            if (flag) {
                plugs.push(flag << bit);
            }
        }
        return plugs;
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