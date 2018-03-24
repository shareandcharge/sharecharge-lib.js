import { expect } from 'chai';
import { Wallet } from '../../src/models/wallet';

describe('HD Wallet', function() {

    it('should generate the same sequence of child nodes each time', () => {
        const wallet = Wallet.generate().wallet;
        const key = wallet.keyAtIndex(0);
        const keyCopy = wallet.keyAtIndex(0);
        expect(key.address).to.equal(keyCopy.address);
    });

    it('should generate the same keys given the same seed', () => {
        const wallet1 = Wallet.generate();
        const wallet2 = new Wallet(wallet1.seed);
        const wallet1Key = wallet1.wallet.keyAtIndex(0);
        const wallet2Key = wallet2.keyAtIndex(0);
        expect(wallet1Key.address).to.equal(wallet2Key.address);
    });

    it('should generate different keys given different seeds', () => {
        const wallet1 = Wallet.generate().wallet;
        const wallet2 = Wallet.generate().wallet;
        const wallet1Key = wallet1.keyAtIndex(0);
        const wallet2Key = wallet2.keyAtIndex(0);
        expect(wallet1Key.address).to.not.equal(wallet2Key.address);
    });

    it('should create sub accounts containing different keys', () => {
        const sub1 = new Wallet('hello world', 0);
        const sub2 = new Wallet('hello world', 1);
        const sub1Key = sub1.keyAtIndex(0);
        const sub2Key = sub2.keyAtIndex(0);
        expect(sub1Key.address).to.not.equal(sub2Key.address);
    });

});