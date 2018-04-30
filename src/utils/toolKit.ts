import * as crypto from 'crypto';
import * as sjcl from 'sjcl';
import * as bs58 from 'bs58';
const web3Utils = require('web3').utils;

export class ToolKit {

    static randomBytes32String(): string {
        return '0x' + crypto.randomBytes(32).toString('hex');
        // let bytes = '';
        // for (let i = 0; i < 6; i++) {
        //     bytes += Math.random().toString(16).substr(2);
        // }
        // return '0x' + bytes.substr(0, 64);
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

    static encrypt(data: any, password: string): string {
        return sjcl.encrypt(password, JSON.stringify(data));
    }

    static decrypt(data: string, password: string): object {
        return JSON.parse(sjcl.decrypt(password, data));
    }

    static contractDefsForStage(stage: string, verbose: boolean = false) {
        const json = require(`@motionwerk/sharecharge-contracts/contract.defs.${stage}.json`);
        return json;
    }
}