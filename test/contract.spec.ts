import { Contract } from '../src/services/contract';
import { expect } from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import { Stub } from './helpers';
import { connector, registerParams } from './data';

describe('Contract Module', function () {

    let contract;
    const sandbox = sinon.createSandbox();

    beforeEach(function () {
        contract = new Contract({pass: ''});
    });

    afterEach(function () {
        sandbox.restore();
    });

    context('#sendTx()', function () {

        it('should resolve with transaction receipt on success', function () {

        });

        it('should throw if unable to form transaction', function () {

        });

    });

    context('#convertBytes()', function () {
        it('should convert bytes returned from solidity getter method', function () {
            const bytes = '0x0200000000000000000000000000000000000000000000000000000000000000';
            expect(contract.convertBytes(bytes)).to.equal('0x02');
        });
    });

});