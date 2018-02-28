import { expect } from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import { Stub } from './helpers';

import { Wallet } from '../src/services/wallet';

describe.only('Wallet', function () {

    let wallet;

    beforeEach(function () {
        wallet = new Wallet();
    });

    context('#seed()', function () {
        it('should create 12 word mnemonic seed', function () {
            const seed = wallet.seed();
            expect(seed.split(' ').length).to.equal(12);
        });
    });

    context('#create()', function () {

        it('should create new keypair and resolve with single public address', async function () {
            const seed = wallet.seed();
            const addresses = await wallet.create(seed);
            expect(addresses.length).to.equal(1);
            expect(addresses[0].length).to.equal(42);
        });

        it('should generate same key from a single seed and password', async function () {
            const seed = wallet.seed();
            await wallet.create(seed, '123');
            const address1 = wallet.address;

            const wallet2 = new Wallet();
            await wallet2.create(seed, '123');
            const address2 = wallet2.address;

            expect(address1).to.equal(address2);
        });

    });

    context('#address', function () {

        it('should retreive address from private ks', async function () {
            await wallet.create(wallet.seed());
            const address = wallet.address;
            expect(address.length).to.equal(42);
        });

        it('should return undefined if keypair not yet generated', function () {
            expect(wallet.address).to.equal(undefined);
        });

    });

});