import { Bridge } from '../src/bridge';
import { expect } from 'chai';
import 'mocha';

describe('version', () => {
  it('should report version', () => {
    const bridge = new Bridge();
    expect(bridge.version).to.equal('0.1.0');
  });
});
