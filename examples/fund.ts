import { Wallet } from '../src/models/wallet';
import { Key } from '../src/models/key';
import { TestHelper } from '../test/testHelper';

const Web3 = require('web3');

async function main() {

    const wallet1 = new Wallet('filter march urge naive sauce distance under copy payment slow just warm');
    const wallet2 = new Wallet('filter march urge naive sauce distance under copy payment slow just cool');

    const web3 = new Web3('http://localhost:8545');

    await TestHelper.ensureFunds(web3, wallet1.keychain[0]);
    await TestHelper.ensureFunds(web3, wallet2.keychain[0]);
}

main();