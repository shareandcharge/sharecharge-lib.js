import * as crypto from 'crypto';
import * as bs58 from 'bs58';
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

    static ipfsHashToBytes32(hash: string): string {
        const bytes = bs58.decode(hash);
        // first two bytes describe hash function [12, 20]`
        const content = bytes.slice(2, 34);
        return '0x' + content.toString('hex');
    }

    static bytes32ToIpfsHash(bytes: string): string {
        // remove 0x and re-add hash function
        bytes = bytes.slice(2, 66);
        bytes = '1220' + bytes;
        return bs58.encode(Buffer.from(bytes, 'hex'));
    }

    static contractDefsForStage(stage: string, verbose: boolean = false) {
        const json = require(`@motionwerk/sharecharge-contracts/contract.defs.${stage}.json`);
        return json;
    }
}