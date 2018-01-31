import { Bridge } from '../src/bridge';
import { expect } from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import { TestContract } from './test-contract';

let testContract, bridge;
let connectorId, controller, args;

beforeEach(async () => {
  testContract = new TestContract();
  bridge = new Bridge(testContract);
  connectorId = (Math.random() * 0xFFFFFFFFF << 0).toString(16);
  controller = (Math.random() * 0xFFFFFFFFF << 0).toString(16);
  args = { connectorId, controller };
});

describe('events', () => {

  it('should subscribe to start events and receive correct command parameters', () => {

    bridge.start$.subscribe(command => {
      expect(command.params.type).to.be.equal('start');
      expect(command.params.connectorId).to.be.equal(connectorId);
      expect(command.params.controller).to.be.equal(controller);
    });

    testContract.emitStart(connectorId, controller);
  });

  it('should subscribe to stop events and receieve correct command parameters', () => {

    bridge.stop$.subscribe(command => {
      expect(command.params.type).to.be.equal('stop');
      expect(command.params.connectorId).to.be.equal(connectorId);
      expect(command.params.controller).to.be.equal(controller);
    });

    testContract.emitStop(connectorId, controller);

  });

});

describe('register', () => {
  it('should register pole');
});

describe('start', () => {

  it('should tell contract that start occurred via event callback', (done) => {

    bridge.start$.subscribe(request => {
      request.success().then(receipt => {
        expect(receipt.status).to.equal('start status');
        expect(receipt.txHash).to.equal('0x11');
        expect(receipt.blockNumber).to.equal(696969);
        expect(receipt.request).to.deep.equal(args);
        done();

      });
    });

    testContract.emitStart(connectorId, controller);

  });

  it('should tell contract that error occurred on start with correct error code', (done) => {

    bridge.start$.subscribe(request => {
      request.failure().then(receipt => {
        expect(receipt.request.errorCode).to.equal(0);
        done();
      });
    });

    testContract.emitStart(connectorId, controller);

  });
});

describe('stop', () => {
  it('should tell contract that stop occurred via event callback', (done) => {
    bridge.stop$.subscribe(request => {

      request.success().then(receipt => {

        expect(receipt.status).to.equal('stop status');
        expect(receipt.txHash).to.equal('0x22');
        expect(receipt.blockNumber).to.equal(700131);
        expect(receipt.request).to.deep.equal({ connectorId: args.connectorId });
        done();

      });
    });

    testContract.emitStop(connectorId, controller);
  });

  it('should tell contract error occurred on stop with correct error code', (done) => {

    bridge.stop$.subscribe(request => {
      request.failure().then(receipt => {
        expect(receipt.request.errorCode).to.equal(1);
        done();
      });
    });

    testContract.emitStop(connectorId, controller);
  });

});
