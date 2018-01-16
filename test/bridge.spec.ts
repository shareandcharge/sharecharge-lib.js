import { Bridge } from '../src/bridge';
import { expect } from 'chai';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import { TestContract } from './test-contract';

describe('events', () => {

  const testContract = new TestContract();
  const bridge = new Bridge(testContract);

  it('should subscribe to start events', () => {

    const randomPoleAddress = (Math.random() * 0xFFFFFFFFF << 0).toString(16);
    const randomUserAddress = (Math.random() * 0xFFFFFFFFF << 0).toString(16);

    bridge.start$.subscribe(command => {
      expect(command.params.type).to.be.equal('start');
      expect(command.params.pole).to.be.equal(randomPoleAddress);
      expect(command.params.user).to.be.equal(randomUserAddress);
    });

    testContract.emitStart(randomPoleAddress, randomUserAddress);
  });

  it('should subscribe to stop events', () => {

    const randomPoleAddress = (Math.random() * 0xFFFFFFFFF << 0).toString(16);
    const randomUserAddress = (Math.random() * 0xFFFFFFFFF << 0).toString(16);

    bridge.stop$.subscribe(command => {
      expect(command.params.type).to.be.equal('stop');
      expect(command.params.pole).to.be.equal(randomPoleAddress);
      expect(command.params.user).to.be.equal(randomUserAddress);
    });

    testContract.emitStop(randomPoleAddress, randomUserAddress);

  });

});

describe('register', () => {
  it('should register pole');
});

describe('start', () => {
  it('should tell contract that start occurred');
  it('should tell contract that start failed');
});

describe('stop', () => {
  it('should tell contract that stop occurred');
  it('should tell contract that stop failed');
});
