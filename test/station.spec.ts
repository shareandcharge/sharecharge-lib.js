import * as sinon from 'sinon';
import * as mocha from 'mocha';
import { expect } from 'chai';
import { Station } from '../src/models/station';
import { StationBuilder } from './stationBuilder';

describe('Station', function () {

    context('owner', () => {

        it('should handle mixed case address strings', () => {
            let owner = "0xc1912fee45d61c87cc5ea59dAE31190fffff232d";
            let station = new Station();
            station.owner = owner;
            expect(station.owner).to.equal(owner.toLowerCase());
        });

        it('should allow a valid address string', () => {
            let owner = "0xc1912fee45d61c87cc5ea59dae31190fffff232d";
            let station = new Station();
            station.owner = owner;
            expect(station.owner).to.equal(owner.toLowerCase());
        });

        it('should not allow invalid address strings', () => {
            let owner = "0xc1912fee45d61c87cc5ea59dae31190ffff";
            expect(() => { new Station().owner = owner; }).to.throw('Value is not a valid address string');
        });

        it('should not allow non address strings', () => {
            let owner = "hello world";
            expect(() => { new Station().owner = owner; }).to.throw('Value is not a valid address string');
        });
    });

    context('latitude', () => {
        it('should not allow values less then -90', () => {
            expect(() => { new Station().latitude = -91; }).to.throw('Latitude range is -90 to 90 degrees');
        });

        it('should not allow values greater then 90', () => {
            expect(() => { new Station().latitude = 91; }).to.throw('Latitude range is -90 to 90 degrees');
        });
    });

    context('longitude', () => {
        it('should not allow values less then -180', () => {
            expect(() => { new Station().longitude = -181; }).to.throw('Longitude range is -180 to 180 degrees');
        });

        it('should not allow values greater then 180', () => {
            expect(() => { new Station().longitude = 181; }).to.throw('Longitude range is -180 to 180 degrees');
        });
    });

    it('should deserialize a station', () => {
        let payload = {
            id: '0xd65a96b1d16c4fca52fc1fd845b63ac5a86f8b8c0fe1970420ec02fc154af884',
            owner: '0xBD422974a93966C37bb740daF4d248dEE88C7ca1',
            latitude: '51345000',
            longitude: '-9233200',
            openingHours: '0x3030303030303030303030303030303030303030303030303030303000000000',
            available: true
        };

        let station = Station.deserialize(payload);

        expect(station.id).to.equal("0xd65a96b1d16c4fca52fc1fd845b63ac5a86f8b8c0fe1970420ec02fc154af884");
        expect(station.owner).to.equal("0xBD422974a93966C37bb740daF4d248dEE88C7ca1");
        expect(station.latitude).to.equal(51.345000);
        expect(station.longitude).to.equal(-9.2332000);
        expect(station.openingHours).to.equal("0000000000000000000000000000");
        expect(station.available).to.equal(true);
    });

});

