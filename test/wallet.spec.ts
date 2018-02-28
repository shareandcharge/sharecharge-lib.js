import { expect } from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import { Stub } from './helpers';

import { Wallet } from '../src/services/wallet';

describe('Wallet', function() {

    let wallet;

    beforeEach(function() {
        wallet = new Wallet();
    });

    it('should create new keypair and resolve with public address', async function() {
        const addresses = await wallet.create();
        expect(addresses.length).to.equal(1);
        expect(addresses[0].length).to.equal(42);
    });

});