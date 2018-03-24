import { expect } from 'chai';
import { Station } from '../../src/models/station';
import { OpeningHours } from '../../src/models/openingHours';
import { ToolKit } from '../../src/utils/toolKit';

describe('Station', function () {

    context('latitude', () => {
        it('should not allow values less then -90', () => {
            const station = new Station();
            station.latitude = -90;
            station.latitude = -91;
            expect(station.latitude).to.not.equal(-91);
            expect(station.latitude).to.equal(-90);
        });

        it('should not allow values greater then 90', () => {
            const station = new Station();
            station.latitude = 90;
            station.latitude = 91;
            expect(station.latitude).to.not.equal(91);
            expect(station.latitude).to.equal(90);
        });
    });

    context('longitude', () => {
        it('should not allow values less then -180', () => {
            const station = new Station();
            station.longitude = -180;
            station.longitude = -181;
            expect(station.longitude).to.not.equal(-181);
            expect(station.longitude).to.equal(-180);
        });

        it('should not allow values greater then 180', () => {
            const station = new Station();
            station.longitude = 180;
            station.longitude = 181;
            expect(station.longitude).to.not.equal(181);
            expect(station.longitude).to.equal(180);
        });
    });

    it('should deserialize a station', () => {
        const payload = {
            id: '0xd65a96b1d16c4fca52fc1fd845b63ac5a86f8b8c0fe1970420ec02fc154af884',
            owner: '0xBD422974a93966C37bb740daF4d248dEE88C7ca1',
            latitude: '51345000',
            longitude: '-9233200',
            openingHours: '0x30303936303039363030393630303936303039363030393630303936',
            available: true
        };

        const station = Station.deserialize(payload);

        expect(station.id).to.equal('0xd65a96b1d16c4fca52fc1fd845b63ac5a86f8b8c0fe1970420ec02fc154af884');
        expect(station.owner).to.equal('0xBD422974a93966C37bb740daF4d248dEE88C7ca1');
        expect(station.latitude).to.equal(51.345000);
        expect(station.longitude).to.equal(-9.2332000);
        expect(station.openingHours.toString()).to.equal(new OpeningHours().toString());
    });

});

