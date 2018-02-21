import { ShareAndCharge } from '../src/shareAndCharge';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { TestContract } from './test-contract';
import { connector, registerParams } from './data';
import { Stub } from './helpers';

let testContract, sc, stub;
let clientId, connectorId, controller, args;
const sandbox = sinon.createSandbox();

beforeEach(async () => {
  testContract = new TestContract();
  sc = new ShareAndCharge(testContract);
  stub = new Stub(sandbox, sc.contract);
  connectorId = (Math.random() * 0xFFFFFFFFF << 0).toString(16);
  controller = (Math.random() * 0xFFFFFFFFF << 0).toString(16);
  clientId = (Math.random() * 0xFFFFFFFFF << 0).toString(16);
  args = { clientId, connectorId, controller };
});

afterEach(async () => {
  sandbox.restore();
});

describe('events', () => {

  it('should subscribe to start events and receive correct command parameters', () => {

    sc.start$.subscribe(command => {
      expect(command.params.type).to.be.equal('start');
      expect(command.params.clientId).to.be.equal(clientId);
      expect(command.params.connectorId).to.be.equal(connectorId);
      expect(command.params.controller).to.be.equal(controller);
    });

    testContract.emitStart(clientId, connectorId, controller);
  });

  it('should subscribe to stop events and receieve correct command parameters', () => {

    sc.stop$.subscribe(command => {
      expect(command.params.type).to.be.equal('stop');
      expect(command.params.connectorId).to.be.equal(connectorId);
      expect(command.params.controller).to.be.equal(controller);
    });

    testContract.emitStop(clientId, connectorId, controller);

  });

});

describe('start', () => {

  const stubReceipt = {
    status: 'start status',
    txHash: '0x11',
    blockNumber: 696969
  };

  it('should tell contract that start occurred via event callback', (done) => {

    stub.resolves('sendTx', stubReceipt, 'confirmStart', connectorId, controller);

    sc.start$.subscribe(request => {
      request.success().then(receipt => {
        expect(receipt).to.deep.equal(stubReceipt);
        done();
      });
    });

    testContract.emitStart(clientId, connectorId, controller);

  });

  it('should tell contract that error occurred on start with correct error code', (done) => {

    stub.resolves('sendTx', stubReceipt, 'logError', connectorId, 0);

    sc.start$.subscribe(request => {
      request.failure().then(receipt => {
        expect(receipt).to.deep.equal(stubReceipt);
        done();
      });
    });

    testContract.emitStart(clientId, connectorId, controller);

  });
});

describe('stop', () => {

  const stubReceipt = {
    status: 'stop status',
    txHash: '0x22',
    blockNumber: 700131
  };

  it('should tell contract that stop occurred via event callback', (done) => {
    stub.resolves('sendTx', stubReceipt, 'confirmStop', connectorId);

    sc.stop$.subscribe(request => {
      request.success().then(receipt => {
        expect(receipt).to.deep.equal(stubReceipt);
        done();

      });
    });

    testContract.emitStop(clientId, connectorId, controller);
  });

  it('should tell contract error occurred on stop with correct error code', (done) => {

    stub.resolves('sendTx', stubReceipt, 'logError', connectorId, 1);

    sc.stop$.subscribe(request => {
      request.failure().then(receipt => {
        expect(receipt).to.deep.equal(stubReceipt);
        done();
      });
    });

    testContract.emitStop(clientId, connectorId, controller);
  });

});

describe('#registerConnector()', () => {
  it('should register connector and return receipts if successful', async () => {
    const stubReceipt = { transactionHash: '0x01', blockNumber: 55 };
    stub.resolves('sendTx', stubReceipt, 'registerConnector', ...Object.values(registerParams('0x01')));
    const result = await sc.registerConnector(connector, '0x01');
    expect(result).to.deep.equal(stubReceipt);
  });
});

describe('#setUnavailable()', function() {

  it('should resolve with receipt if successfully updated', async function() {
    const stubReceipt = { transactionHash: '0x1', blockNumber: 1 };
    stub.resolves('queryState', true, 'isAvailable', connectorId);
    stub.resolves('sendTx', stubReceipt, 'setAvailability', clientId, connectorId, false);
    const result = await sc.setUnavailable(connectorId, clientId);
    expect(result).to.deep.equal(stubReceipt);
  });

});
