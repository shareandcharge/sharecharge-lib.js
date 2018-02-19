import { Contract } from '../src/services/contract';
import { expect } from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import { Stub } from './helpers';

describe('Contract Module', function() {

    let contract, stub;
    const sandbox = sinon.createSandbox();

    beforeEach(function() {
        contract = new Contract('');
    });

    afterEach(function() {
        sandbox.restore();
    });

    context('sendTx wrappers', function() {

        beforeEach(function() {
            stub = new Stub(sandbox, contract);
        });

        it('should resolve with transaction receipt if confirm start successful', async function() {
            const stubReceipt = { transactionHash: '0x123', blockNumber: 1 };
            stub.resolves('sendTx', stubReceipt, 'confirmStart', 1, 2, 3);
            const receipt = await contract.confirmStart(1, 2, 3);
            expect(receipt).to.deep.equal(stubReceipt);
        });

    });

    context('#sendTx()', function() {

        it('should resolve with transaction receipt on success');
        it('should throw if unable to form transaction');

    });

});