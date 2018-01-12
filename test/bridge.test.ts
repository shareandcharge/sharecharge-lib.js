import { StartRequest } from './../src/models/started-request';
import { Bridge } from '../src/bridge';

describe('version', () => {
  it('should report version', () => {
    const bridge = new Bridge();
    expect(bridge.version).toBe('0.1.0');
  });
});
