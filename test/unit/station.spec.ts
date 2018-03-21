import { expect } from 'chai';
import { Station } from '../../src/models/station';

describe('Station', function () {

    context('owner', () => {

        it('should allow a valid address string', () => {
            const station = new Station();
            const owner = '0xc1912fee45d61c87cc5ea59dae31190fffff232d';
            station.owner = owner;
            expect(station.owner).to.equal(owner.toLowerCase());
        });

        it('should handle mixed case address strings', () => {
            const station = new Station();
            const owner = '0xc1912fee45d61c87cc5ea59dAE31190fffff232d';
            station.owner = owner;
            expect(station.owner).to.equal(owner.toLowerCase());
        });

        it('should not set an invalid address strings', () => {
            const station = new Station();
            station.owner = '0xc1912fee45d61c87cc5';
            expect(station.owner).to.not.equal('0xc1912fee45d61c87cc5');
        });

        it('should not allow non address strings', () => {
            const station = new Station();
            station.owner = 'hello world';
            expect(station.owner).to.not.equal('hello world');
        });
    });

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
            openingHours: '0x3030303030303030303030303030303030303030303030303030303000000000',
            available: true
        };

        const station = Station.deserialize(payload);

        expect(station.id).to.equal('0xd65a96b1d16c4fca52fc1fd845b63ac5a86f8b8c0fe1970420ec02fc154af884');
        expect(station.owner).to.equal('0xBD422974a93966C37bb740daF4d248dEE88C7ca1');
        expect(station.latitude).to.equal(51.345000);
        expect(station.longitude).to.equal(-9.2332000);
        expect(station.openingHours).to.equal('0000000000000000000000000000');
    });

});

