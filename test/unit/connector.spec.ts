import { PlugType } from './../../src/models/plugType';
import { expect } from 'chai';
import { Connector } from '../../src/models/connector';

describe('Connector', function () {

    it('should deserialize a Connector', () => {
        let payload = {
            id: '0xd65a96b1d16c4fca52fc1fd845b63ac5a86f8b8c0fe1970420ec02fc154af884',
            owner: '0xBD422974a93966C37bb740daF4d248dEE88C7ca1',
            stationId: '0x00aabb0000000000000000000000000000000101',
            plugMask: PlugType.Typ1 | PlugType.SchukoSteckdose | PlugType.Typ2,
            available: true
        };

        let connector = Connector.deserialize(payload);

        expect(connector.id).to.equal('0xd65a96b1d16c4fca52fc1fd845b63ac5a86f8b8c0fe1970420ec02fc154af884');
        expect(connector.owner).to.equal('0xBD422974a93966C37bb740daF4d248dEE88C7ca1');
        expect(connector.stationId).to.equal('0x00aabb0000000000000000000000000000000101');
        expect(connector.plugTypes).to.members([PlugType.Typ1, PlugType.Typ2, PlugType.SchukoSteckdose]);
        expect(connector.available).to.equal(true);
    });

});

