import { expect } from 'chai';
import { ToolKit } from '../../src/utils/toolKit';
import { Wallet } from '../../src/models/wallet';
import 'mocha';

describe('ToolKit', () => {

    const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just warm');
    const address = wallet.coinbase;

    it('should generate bytes32 string', () => {
        const bytes32 = ToolKit.randomByteString(32);
        expect(bytes32.length).to.equal(66);
    });

    it('should generate emtpy bytes32 string', () => {
        const bytes32 = ToolKit.emptyByteString(32);
        expect(bytes32.length).to.equal(66);
    });

});
