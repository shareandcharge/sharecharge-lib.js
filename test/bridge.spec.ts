import { ShareAndCharge } from '../src/index';
import { expect } from 'chai';
import * as mocha from 'mocha';
import { TestContract } from './test-contract';

<<<<<<< 0bb33b5f26774458e21b56f305a55c8b4a40210a
let testContract, bridge;
let clientId, connectorId, controller, args;

beforeEach(async () => {
  testContract = new TestContract();
  bridge = new Bridge(testContract);
  clientId = (Math.random() * 0xFFFFFFFFF << 0).toString(16);
=======
let testContract, sc;
let connectorId, controller, args;

beforeEach(async () => {
  testContract = new TestContract();
  sc = new ShareAndCharge(testContract);
>>>>>>> Rename Bridge class to ShareAndCharge
  connectorId = (Math.random() * 0xFFFFFFFFF << 0).toString(16);
  controller = (Math.random() * 0xFFFFFFFFF << 0).toString(16);
  args = { clientId, connectorId, controller };
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
  it('should register pole');
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
