import { expect } from 'chai'; 
import { EventDispatcher } from '../../src/models/eventDispatcher';

describe('EventDispatcher', function () {

    let eventDispatcher;

    beforeEach(async () => {
        eventDispatcher = new EventDispatcher<string>();
    });

    context('#addEventListener()', () => {
        it('should add a single listener', () => {
            let actual = "";

            eventDispatcher.addEventListener('StationCreated', result => actual = result);

            eventDispatcher.dispatchAll('StationCreated', "0x1923829329");

            expect(actual).to.equal("0x1923829329");
        });
    });

    context('#removeAllListeners', () => {
        it('should remove all listeners for the given event type', () => {
            let actual = 0;

            eventDispatcher.addEventListener('StationUpdated', result => actual++);
            eventDispatcher.addEventListener('StationUpdated', result => actual++);

            eventDispatcher.removeAllListeners('StationUpdated');

            eventDispatcher.dispatchAll('StationUpdated');

            expect(actual).to.equal(0);
        });

        it('should only remove listeners for the given event type', () => {
            let createdCalled = false;
            let updatedCalled = false;

            eventDispatcher.addEventListener('StationCreated', result => createdCalled = true);
            eventDispatcher.addEventListener('StationUpdated', result => updatedCalled = true);

            eventDispatcher.removeAllListeners('StationUpdated');

            eventDispatcher.dispatchAll('StationCreated');
            eventDispatcher.dispatchAll('StationUpdated');

            expect(createdCalled).to.equal(true);
            expect(updatedCalled).to.equal(false);

        });
    });

    context('#dispatchAll', () => {
        it('should dispatch only events for given event type', () => {
            let actual = 0;

            eventDispatcher.addEventListener('StationCreated', result => actual++);
            eventDispatcher.addEventListener('StationUpdated', result => actual++);

            eventDispatcher.dispatchAll('StationUpdated');

            expect(actual).to.equal(1);
        });

        it('should dispatch all events for given event type', () => {
            let actual = 0;

            eventDispatcher.addEventListener('StationCreated', result => actual++);
            eventDispatcher.addEventListener('StationCreated', result => actual++);

            eventDispatcher.dispatchAll('StationCreated');

            expect(actual).to.equal(2);
        });
    });

});

