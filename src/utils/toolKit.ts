import * as crypto from 'crypto';
import * as bs58 from 'bs58';
const web3Utils = require('web3').utils;

export class ToolKit {

    static randomByteString(length: number): string {
        return '0x' + crypto.randomBytes(length).toString('hex');
        // let bytes = '';
        // for (let i = 0; i < 6; i++) {
        //     bytes += Math.random().toString(16).substr(2);
        // }
        // return '0x' + bytes.substr(0, 64);
    }

    static emptyByteString(length: number): string {
        let bytes = '0x';
        for (let i = 0; i < length * 2; i++) {
            bytes += '0';
        }
        return bytes;
    }

    static hexToString(val: string): string {
        return web3Utils.hexToString(val);
    }

    static asciiToHex(val: string): string {
        return web3Utils.asciiToHex(val);
    }

    static isAddress(val: string): boolean {
        return web3Utils.isAddress(val);
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

    static removeIndexKeys(obj: any): any {
        Object.keys(obj).map(k => {
            if (parseInt(k) >= 0) {
                delete obj[k];
            }
        });
        return obj;
    }

    static contractDefsForStage(stage: string, verbose: boolean = false) {
        const json = require(`@motionwerk/sharecharge-contracts/contract.defs.${stage}.json`);
        return json;
    }
}