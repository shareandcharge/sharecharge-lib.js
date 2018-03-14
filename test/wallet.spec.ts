import { expect } from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import { Stub } from './helpers';

import { Wallet } from '../src/services/wallet';

describe('Wallet', function () {

    // let wallet;

    // beforeEach(function () {
    //     wallet = new Wallet();
    // });

    // context('#seed()', function () {
    //     it('should create 12 word mnemonic seed', function () {
    //         const seed = wallet.seed();
    //         expect(seed.split(' ').length).to.equal(12);
    //     });
    // });

    // context('#create()', function () {

    //     it('should create new keypair and resolve with single public address', function () {
    //         const seed = wallet.seed();
    //         const address = wallet.create(seed);
    //         expect(address.length).to.equal(42);
    //     });

    //     it('should generate same key from a single seed', function () {
    //         const seed = wallet.seed();
    //         const address1 = wallet.create(seed);
    //         const address2 =  wallet.create(seed);
    //         expect(address1).to.equal(address2);
    //     });

    //     it('should generate different keys from different seeds', function() {
    //         const seed1 = wallet.seed();
    //         const seed2 = wallet.seed();
    //         const address1 = wallet.create(seed1);
    //         const address2 = wallet.create(seed2);
    //         expect(address1).to.not.equal(address2);
    //     });

    // });

    // context('#address', function () {

    //     it('should retrieve address from private ks', function () {
    //         wallet.create(wallet.seed());
    //         const address = wallet.address;
    //         expect(address.length).to.equal(42);
    //     });

    //     it('should return undefined if keypair not yet generated', function () {
    //         expect(wallet.address).to.equal(undefined);
    //     });

    // });

    // context('#ks', function() {
    //     it('should retrieve ks after generation', function() {
    //         wallet.create(wallet.seed());
    //         expect(wallet.ks).to.haveOwnProperty('_privKey');
    //     });
    // });

});