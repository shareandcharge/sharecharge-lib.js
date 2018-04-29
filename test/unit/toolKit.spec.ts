import { expect } from 'chai';
import { ToolKit } from '../../src/utils/toolKit';
import { Wallet } from '../../src/models/wallet';
const location = require('../data/ocpiLocation.json');
const encLocation = require('../data/encLocation.json');

describe('ToolKit', () => {

    const wallet = new Wallet('filter march urge naive sauce distance under copy payment slow just warm');
    const address = wallet.keychain[0].address;

    it('should encrypt and decrypt data', () => {
        const encryptedData = ToolKit.encrypt(location, address);
        const decryptedData = ToolKit.decrypt(encryptedData, address);
        expect(decryptedData['id']).to.equal(location.id);
    });

});
