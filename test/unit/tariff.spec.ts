import { expect } from 'chai';
import { Tariff } from '../../src/models/tariff';
import { TariffElement } from '../../src/models/tariffElement';
const tariffsObject = require('../data/ocpiTariffs');
import 'mocha';

describe('Tariff', () => {

    it('should deserialize tariffElements correctly', () => {
        const tariffElement = TariffElement.deserialize(tariffsObject[0].elements);
        expect(tariffElement[0].priceComponents.type).to.equal('FLAT');
    });

    it('should deserialize tariffs correctly', () => {
        const tariff = Tariff.deserialize(tariffsObject);
        expect(tariff['1'].id).to.equal('1');
    });

    it('should get all time based rates on tariff', () => {
        const tariff = Tariff.deserialize(tariffsObject)['1'];
        expect(tariff.timeRates.length).to.equal(3);
    });

    it('should get all flat rates on tariff', () => {
        const tariff = Tariff.deserialize(tariffsObject)['1'];
        expect(tariff.flatRates.length).to.equal(1);
    });

});