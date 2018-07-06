import { expect } from 'chai';
import { ToolKit } from '../../src/utils/toolKit';
import { Wallet } from '../../src/models/wallet';
import 'mocha';

describe('ToolKit', () => {

    const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just warm');
    const address = wallet.coinbase;

    const scId = '0x35312e3034373539392c332e373239393434';

    it('should generate bytes32 string', () => {
        const bytes32 = ToolKit.randomByteString(32);
        expect(bytes32.length).to.equal(66);
    });

    it('should generate emtpy bytes32 string', () => {
        const bytes32 = ToolKit.emptyByteString(32);
        expect(bytes32.length).to.equal(66);
    });

    it('should convert geolocation to scId', () => {
        const coordinates = {
            latitude: "51.047599",
            longitude: "3.729944"
        };
        const result = ToolKit.geolocationToScId(coordinates);
        expect(result).to.equal(scId);
    });

    it('should convert solidity bytes32 to scId', () => {
        const bytes32 = scId.padEnd(66, '0');
        const result = ToolKit.hexToScId(bytes32);
        expect(result).to.equal(scId);
    });

    it('should convert geolocation from scId', () => {
        const result = ToolKit.scIdToGeolocation(scId);
        expect(result.latitude).to.equal("51.047599");
        expect(result.longitude).to.equal("3.729944");
    });

});
