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

describe('register', () => {
  it('should register connector and return receipts if successful', async () => {
    const stubReceipt = { transactionHash: '0x01', blockNumber: 55 };
    stub.resolves('sendTx', stubReceipt, 'registerConnector', ...Object.values(registerParams('0x01')));
    const result = await sc.registerConnector(connector, '0x01');
    expect(result).to.deep.equal(stubReceipt);
  });
});

describe('start', () => {

  it('should tell contract that start occurred via event callback', (done) => {

    sc.start$.subscribe(request => {
      request.success().then(receipt => {
        expect(receipt.status).to.equal('start status');
        expect(receipt.txHash).to.equal('0x11');
        expect(receipt.blockNumber).to.equal(696969);
        expect(receipt.request).to.deep.equal({ connectorId: args.connectorId, controller: args.controller });
        done();

      });
    });

    testContract.emitStart(clientId, connectorId, controller);

  });

  it('should tell contract that error occurred on start with correct error code', (done) => {

    sc.start$.subscribe(request => {
      request.failure().then(receipt => {
        expect(receipt.request.errorCode).to.equal(0);
        done();
      });
    });

    testContract.emitStart(clientId, connectorId, controller);

  });
});

describe('stop', () => {
  it('should tell contract that stop occurred via event callback', (done) => {
    sc.stop$.subscribe(request => {

      request.success().then(receipt => {

        expect(receipt.status).to.equal('stop status');
        expect(receipt.txHash).to.equal('0x22');
        expect(receipt.blockNumber).to.equal(700131);
        expect(receipt.request).to.deep.equal({ connectorId: args.connectorId });
        done();

      });
    });

    testContract.emitStop(clientId, connectorId, controller);
  });

  it('should tell contract error occurred on stop with correct error code', (done) => {

    sc.stop$.subscribe(request => {
      request.failure().then(receipt => {
        expect(receipt.request.errorCode).to.equal(1);
        done();
      });
    });

    testContract.emitStop(clientId, connectorId, controller);
  });

});

describe('#updateStatus()', function() {

  it('should filter conflicting statuses and return receipts after poles updated', async function() {
    const result = await sc.updateStatus(['123', '789']);
    expect(result.points.length).to.equal(1);
  });

  it('should return error if unable to update status', async function() {
    const result = await sc.updateStatus(['456']);
    expect(result.errors[0] instanceof Error).to.equal(true);
  });

});
