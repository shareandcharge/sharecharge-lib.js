import { Contract } from '../src/services/contract';
import { expect } from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import { Stub } from './helpers';
import { connector, registerParams } from './data';

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

        it('should unpack connector parameters and resolve with receipt after registration', async function() {
            const client = '0x09';
            const stubReceipt = { transactionHash: '0x127', blockNumber: 5 };
            stub.resolves('sendTx', stubReceipt, 'registerConnector', ...Object.values(registerParams(client)));
            const receipt = await contract.register(connector, '0x09');
            expect(receipt).to.deep.equal(stubReceipt);
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