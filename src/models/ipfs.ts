import * as bs58 from 'bs58';
import { ToolKit } from '../utils/toolKit';

export class Ipfs {

    constructor(private ipfs) {}

    async add(content: string): Promise<object> {
        const contentBuffer = Buffer.from(content);
        const result = await this.ipfs.files.add(contentBuffer);
        return {
            ipfs: result[0].hash,
            solidity: ToolKit.ipfsHashToBytes32(result[0].hash)
        };
    }

    async get(bytes32: string): Promise<string> {
        const hash = ToolKit.bytes32ToIpfsHash(bytes32);
        const result = await this.ipfs.files.get(hash);
        return result[0].content.toString();
    }

}