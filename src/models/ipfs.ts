import { ToolKit } from '../utils/toolKit';

export class Ipfs {

    constructor(private ipfs) {}

    async add(content: string): Promise<{ ipfs: string, solidity: string }> {
        const contentBuffer = Buffer.from(content);
        const result = await this.ipfs.files.add(contentBuffer);
        return {
            ipfs: result[0].hash,
            solidity: ToolKit.ipfsHashToBytes32(result[0].hash)
        };
    }

    async cat(bytes32: string): Promise<string> {
        const hash = ToolKit.bytes32ToIpfsHash(bytes32);
        const result = await this.ipfs.files.cat(hash);
        return JSON.parse(result.toString());
    }

}