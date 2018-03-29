import * as crypto from 'crypto';

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
        const json = require(`sharecharge-contracts/contract.defs.${stage}.json`);
        return json;
    }
}