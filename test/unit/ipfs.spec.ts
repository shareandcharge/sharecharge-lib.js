import { expect } from 'chai';
import { IpfsProvider } from '../../src/services/ipfsProvider';
import { ConfigProvider } from '../../src/services/configProvider';
import { ToolKit } from '../../src/utils/toolKit';

describe('Ipfs', () => {

    const ipfsProvider = new IpfsProvider(new ConfigProvider);
    const ipfs = ipfsProvider.obtain();
    const exampleHash = 'QmU8Hhfz8MxPakRAazGUY2DA9EtQpTvVPVf51KgRd8x5yA';

    it('should convert between ipfs and solidity data types', () => {
        const bytes = ToolKit.ipfsHashToBytes32(exampleHash);
        const ipfs = ToolKit.bytes32ToIpfsHash(bytes);
        expect(ipfs).to.equal(exampleHash);
    });

    // requires IPFS node running
    it.skip('should cat from bytes32 string', async () => {
        const bytes = ToolKit.ipfsHashToBytes32(exampleHash);
        const content = await ipfs.cat(bytes);
        expect(content['a']).to.equal(123);
    });

});