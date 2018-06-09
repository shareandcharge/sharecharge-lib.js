import { expect } from 'chai';
import { Wallet } from '../../src/models/wallet';
import { TestHelper } from '../testHelper';
import 'mocha';

const keystore = require('../data/keystore.json');

describe('HD Wallet', function () {

    it('should generate the same keys given the same seed', () => {
        const wallet1 = Wallet.generate();
        const wallet2 = new Wallet(wallet1.seed);
        expect(wallet1.wallet.coinbase).to.equal(wallet2.coinbase);
    });

    it('should generate different keys given different seeds', () => {
        const wallet1 = Wallet.generate().wallet;
        const wallet2 = Wallet.generate().wallet;
        expect(wallet1.coinbase).to.not.equal(wallet2.coinbase);
    });

    it('should populate wallet from v3 json keystore', () => {
        const wallet = Wallet.fromV3(keystore, 'hello');
        expect(wallet.coinbase).to.equal('0x' + keystore.address);
    });

    it('should create sub accounts containing different keys', () => {
        const sub1 = new Wallet('hello world', 0);
        const sub2 = new Wallet('hello world', 1);
        expect(sub1.coinbase).to.not.equal(sub2.coinbase);
    });

    it('should initialise wallet with n keys', () => {
        const wallet = new Wallet('hello world', 0, 5);
        expect(wallet.keychain.length).to.equal(5);
    });

    it('should add new keys to the keychain', () => {
        const wallet = new Wallet('hello world');
        expect(wallet.keychain.length).to.equal(1);
        const success = wallet.addKey('hello world');
        expect(success).to.equal(true);
        expect(wallet.keychain.length).to.equal(2);
    });

    it('should not add new keys to the keychain if seed is incorrect', () => {
        const wallet = new Wallet('hello world');
        const success = wallet.addKey('hallo world');
        expect(success).to.equal(false);
        expect(wallet.keychain.length).to.equal(1);
    });

});
