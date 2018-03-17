const web3Utils = require('web3').utils;
import * as crypto from 'crypto';

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
}