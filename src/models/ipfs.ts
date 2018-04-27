import * as bs58 from 'bs58';
import { ToolKit } from '../utils/toolKit';

export class Ipfs {

    constructor(private ipfs) {}

    async add(content: object): Promise<object> {
        const contentBuffer = Buffer.from(JSON.stringify(content));
        const result = await this.ipfs.files.add(contentBuffer);
        return {
            ipfs: result[0].hash,
            solidity: ToolKit.ipfsHashToBytes32(result[0].hash)
        };
    }

    async get(bytes32: string): Promise<any> {
        const hash = ToolKit.bytes32ToIpfsHash(bytes32);
        const result = await this.ipfs.files.get(hash);
        return JSON.parse(result[0].content.toString());
    }

}