const web3Utils = require('web3').utils;
import * as crypto from 'crypto';
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
        let plugs: PlugType[] = [];
        for (let bit = 0; bit < 16; bit++) {
            let flag = (mask >> bit) & 0x01;
            if (flag) {
                plugs.push(flag << bit);
            }
        }
        return plugs;
    }
}