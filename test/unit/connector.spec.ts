import { expect } from 'chai';
import { Connector } from '../../src/models/connector';
import { PowerType } from '../../src/models/powerType';
import { ConnectorType } from '../../src/models/connectorType';

describe('Connector', function () {

    it.skip('should deserialize correctly', () => {
        const payload = {
            id: '0xd65a96b1d16c4fca52fc1fd845b63ac5a86f8b8c0fe1970420ec02fc154af884',
            owner: '0xBD422974a93966C37bb740daF4d248dEE88C7ca1',
            evseId: '0xd87b96b1d16c4fca52fc1fd845b63ac5a86f8b8c0fe1970420ec02fc154af992',
            standard: 1,
            powerType: 1,
            voltage: 240,
            amperage: 30
        };

        const connector = Connector.deserialize(payload);

        expect(connector.id).to.equal('0xd65a96b1d16c4fca52fc1fd845b63ac5a86f8b8c0fe1970420ec02fc154af884');
        expect(connector.owner).to.equal('0xBD422974a93966C37bb740daF4d248dEE88C7ca1');
        expect(connector.evseId).to.equal('0xd87b96b1d16c4fca52fc1fd845b63ac5a86f8b8c0fe1970420ec02fc154af992');
        expect(connector.standard).to.equal(ConnectorType.DOMESTIC_A);
        expect(connector.powerType).to.equal(PowerType.AC_3_PHASE);
        expect(connector.voltage).to.equal(240);
        expect(connector.amperage).to.equal(30);
    });

});

