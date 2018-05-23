import { ToolKit } from '../utils/toolKit';

export class Ipfs {

    constructor(private ipfs) {}

    async add(content: any): Promise<{ ipfs: string, solidity: string }> {
        const contentBuffer = Buffer.from(JSON.stringify(content));
        const result = await this.ipfs.files.add(contentBuffer);
        return {
            ipfs: result[0].hash,
            solidity: ToolKit.ipfsHashToBytes32(result[0].hash)
        };
    }

    async cat(bytes32: string): Promise<any> {
        const hash = ToolKit.bytes32ToIpfsHash(bytes32);
        const result = await this.ipfs.files.cat(hash);
        return JSON.parse(result.toString());
    }

}