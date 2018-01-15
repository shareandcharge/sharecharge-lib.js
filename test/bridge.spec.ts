import { Bridge } from '../src/bridge';
import { expect } from 'chai';
import 'mocha';
import FakeProvider = require('web3-fake-provider');
import sinon = require('sinon');
import Web3 = require('web3');

const abi = require('../src/config/charge.json');

describe('version', () => {
  it('should report version', () => {
    const bridge = new Bridge();
    expect(bridge.version).to.equal('0.1.0');
  });
});

describe('events', () => {

  // let sandbox = sinon.createSandbox();

  // afterEach(() => {
  //   sandbox.restore();
  // });

  // const provider = new FakeProvider();
  // const web3 = new Web3('ws://localhost:8546');
  // web3.setProvider(provider);
  // const bridge = new Bridge(web3);
  // const mockBridge = sinon.mock(bridge);

  it('should subscribe to start events');
  it('should subscribe to stop events');

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