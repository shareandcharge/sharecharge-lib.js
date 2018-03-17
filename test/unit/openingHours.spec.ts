import { expect } from 'chai';
import { OpeningHours } from '../../src/models/openingHours';

function formatHours(val) {
    return val.from + ' to ' + val.to;
}

describe('OpeningHours', function () {

    it('should create a default opening hours', () => {
        let result = new OpeningHours().toString();
        expect(result).to.equal('0096009600960096009600960096');
    });

    it('should correctly set hours across week days', () => {
        let openingHours = new OpeningHours();
        openingHours.monday.set('08:15', '17:30');
        openingHours.tuesday.set('01:00', '02:00');
        openingHours.wednesday.set('04:30', '05:30');
        openingHours.thursday.set('15:00', '24:00');
        openingHours.friday.set('07:00', '21:00');
        openingHours.saturday.set('12:00', '12:00');
        openingHours.sunday.set('00:00', '23:45');
        expect(openingHours.toString()).to.equal('3370040818226096288448480095');
    });

    it('should not allow a to opening hour before a from opening hour', () => {
        let openingHours = new OpeningHours();
        openingHours.monday.set('08:15', '04:30');
        expect(openingHours.monday.from).to.equal('04:30');
        expect(openingHours.monday.to).to.equal('04:30');
    });

    context('#deserialize', () => {
        it('should handle empty strings', () => {
            let openingHours = OpeningHours.deserialize('');
            expect(openingHours.toString()).to.equal('0096009600960096009600960096');
        });

        it('should handle incorrect strings lengths', () => {
            let openingHours = OpeningHours.deserialize('1234567');
            expect(openingHours.toString()).to.equal('0096009600960096009600960096');
        });

        it('should handle completely invalid strings', () => {
            let openingHours = OpeningHours.deserialize('ahfuriwowkdjfkirjeiwijwlpqk2');
            expect(openingHours.toString()).to.equal('0096009600960096009600960096');
        });

        it('should correctly deserialize a valid string', () => {
            let openingHours = OpeningHours.deserialize('3370040818226096288448480095');
            expect(formatHours(openingHours.monday)).to.equal('08:15 to 17:30');
            expect(formatHours(openingHours.tuesday)).to.equal('01:00 to 02:00');
            expect(formatHours(openingHours.wednesday)).to.equal('04:30 to 05:30');
            expect(formatHours(openingHours.thursday)).to.equal('15:00 to 24:00');
            expect(formatHours(openingHours.friday)).to.equal('07:00 to 21:00');
            expect(formatHours(openingHours.saturday)).to.equal('12:00 to 12:00');
            expect(formatHours(openingHours.sunday)).to.equal('00:00 to 23:45');
        });
    });

});


