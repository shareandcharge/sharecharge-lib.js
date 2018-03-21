import { expect } from 'chai';
import { OpeningHours } from '../../src/models/openingHours';

function formatHours(val) {
    return val.from + ' to ' + val.to;
}

function expectDefault(hours) {
    expect(formatHours(hours.monday)).to.equal('00:00 to 24:00');
    expect(formatHours(hours.tuesday)).to.equal('00:00 to 24:00');
    expect(formatHours(hours.wednesday)).to.equal('00:00 to 24:00');
    expect(formatHours(hours.thursday)).to.equal('00:00 to 24:00');
    expect(formatHours(hours.friday)).to.equal('00:00 to 24:00');
    expect(formatHours(hours.saturday)).to.equal('00:00 to 24:00');
    expect(formatHours(hours.sunday)).to.equal('00:00 to 24:00');
}

describe('OpeningHours', function () {

    it('should create a default opening hours', () => {
        const hours = new OpeningHours();
        expectDefault(hours);
    });

    it('should correctly set hours across week days', () => {
        const hours = new OpeningHours();
        hours.monday.set('08:15', '17:30');
        hours.tuesday.set('01:00', '02:00');
        hours.wednesday.set('04:30', '05:30');
        hours.thursday.set('15:00', '24:00');
        hours.friday.set('07:00', '21:00');
        hours.saturday.set('12:00', '12:00');
        hours.sunday.set('00:00', '23:45');
        expect(formatHours(hours.monday)).to.equal('08:15 to 17:30');
        expect(formatHours(hours.tuesday)).to.equal('01:00 to 02:00');
        expect(formatHours(hours.wednesday)).to.equal('04:30 to 05:30');
        expect(formatHours(hours.thursday)).to.equal('15:00 to 24:00');
        expect(formatHours(hours.friday)).to.equal('07:00 to 21:00');
        expect(formatHours(hours.saturday)).to.equal('12:00 to 12:00');
        expect(formatHours(hours.sunday)).to.equal('00:00 to 23:45');
    });

    it('should not allow an invalid time range', () => {
        const openingHours = new OpeningHours();
        openingHours.monday.set('08:15', '04:30');
        expect(openingHours.monday.from).to.equal('04:30');
        expect(openingHours.monday.to).to.equal('04:30');
    });

    context('#decode', () => {
        it('should handle empty strings', () => {
            expectDefault(OpeningHours.decode(''));
        });

        it('should handle incorrect strings lengths', () => {
            expectDefault(OpeningHours.decode('1234567'));
        });

        it('should handle completely invalid strings', () => {
            expectDefault(OpeningHours.decode('ahfuriwowkdjfkirjeiwijwlpqk2'));
        });

        it('should correctly deserialize a valid string', () => {
            const hours = OpeningHours.decode('3370040818226096288448480095');
            expect(formatHours(hours.monday)).to.equal('08:15 to 17:30');
            expect(formatHours(hours.tuesday)).to.equal('01:00 to 02:00');
            expect(formatHours(hours.wednesday)).to.equal('04:30 to 05:30');
            expect(formatHours(hours.thursday)).to.equal('15:00 to 24:00');
            expect(formatHours(hours.friday)).to.equal('07:00 to 21:00');
            expect(formatHours(hours.saturday)).to.equal('12:00 to 12:00');
            expect(formatHours(hours.sunday)).to.equal('00:00 to 23:45');
        });
    });

});


