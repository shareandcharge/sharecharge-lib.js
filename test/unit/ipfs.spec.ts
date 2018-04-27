import { expect } from 'chai';
import { Ipfs } from '../../src/models/ipfs';
import { IpfsProvider } from '../../src/services/ipfsProvider';
import { ConfigProvider } from '../../src/services/configProvider';
import { ToolKit } from '../../src/utils/toolKit';

describe.only('Ipfs', () => {

    const ipfs = new Ipfs(new IpfsProvider(new ConfigProvider()));
    const exampleHash = 'QmU8Hhfz8MxPakRAazGUY2DA9EtQpTvVPVf51KgRd8x5yA';

    it('should convert between ipfs and solidity data types', () => {
        const bytes = ToolKit.ipfsHashToBytes32(exampleHash);
        const ipfs = ToolKit.bytes32ToIpfsHash(bytes);
        expect(ipfs).to.equal(exampleHash);
    });

});