const web3Utils = require('web3').utils;
import * as crypto from 'crypto';

export class ToolKit {

    static randomBytes32String(): string {
        return '0x' + crypto.randomBytes(32).toString('hex');
    }

    static hexToString(hex: string): string {
        return web3Utils.hexToString(hex);
    }

    static isAddress(val: string): boolean {
        return web3Utils.isAddress(val);
    }
}