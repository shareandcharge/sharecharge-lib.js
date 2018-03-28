import { PlugType } from './../../src/models/plugType';
import { expect } from 'chai';
import { Evse } from '../../src/models/evse';

describe('Evse', function () {

    it('should deserialize correctly', () => {
        const payload = {
            id: '0xd65a96b1d16c4fca52fc1fd845b63ac5a86f8b8c0fe1970420ec02fc154af884',
            owner: '0xBD422974a93966C37bb740daF4d248dEE88C7ca1',
            stationId: '0x00aabb0000000000000000000000000000000101',
            available: true
        };

        const evse = Evse.deserialize(payload);

        expect(evse.id).to.equal('0xd65a96b1d16c4fca52fc1fd845b63ac5a86f8b8c0fe1970420ec02fc154af884');
        expect(evse.owner).to.equal('0xBD422974a93966C37bb740daF4d248dEE88C7ca1');
        expect(evse.stationId).to.equal('0x00aabb0000000000000000000000000000000101');
        expect(evse.available).to.equal(true);
    });

});

