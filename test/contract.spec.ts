import { Contract } from '../src/services/contract';
import { expect } from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import { Stub } from './helpers';
import { connector, registerParams } from './data';

describe('Contract Module', function() {

    let contract;
    const sandbox = sinon.createSandbox();

    beforeEach(function() {
        contract = new Contract('');
    });

    afterEach(function() {
        sandbox.restore();
    });

    context('#sendTx()', function() {

        it('should resolve with transaction receipt on success');
        it('should throw if unable to form transaction');

    });

});