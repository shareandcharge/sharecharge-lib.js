import { expect } from 'chai';
import { StationEvents } from './../src/models/stationEvents';
import { EventDispatcher } from './../src/models/eventDispatcher';

describe('EventDispatcher', function () {

    let eventDispatcher;

    beforeEach(async () => {
        eventDispatcher = new EventDispatcher<StationEvents>();
    });

    context('#addEventListener()', () => {
        it('should add a single listener', () => {
            let actual = "";

            eventDispatcher.addEventListener(StationEvents.Created, result => actual = result);

            eventDispatcher.dispatchAll(StationEvents.Created, "0x1923829329");

            expect(actual).to.equal("0x1923829329");
        });
    });

    context('#removeAllListeners', () => {
        it('should remove all listeners for the given event type', () => {
            let actual = 0;

            eventDispatcher.addEventListener(StationEvents.Updated, result => actual++);
            eventDispatcher.addEventListener(StationEvents.Updated, result => actual++);

            eventDispatcher.removeAllListeners(StationEvents.Updated);

            eventDispatcher.dispatchAll(StationEvents.Updated);

            expect(actual).to.equal(0);
        });

        it('should only remove listeners for the given event type', () => {
            let createdCalled = false;
            let updatedCalled = false;

            eventDispatcher.addEventListener(StationEvents.Created, result => createdCalled = true);
            eventDispatcher.addEventListener(StationEvents.Updated, result => updatedCalled = true);

            eventDispatcher.removeAllListeners(StationEvents.Updated);

            eventDispatcher.dispatchAll(StationEvents.Created);
            eventDispatcher.dispatchAll(StationEvents.Updated);

            expect(createdCalled).to.equal(true);
            expect(updatedCalled).to.equal(false);

        });
    });

    context('#dispatchAll', () => {
        it('should dispatch only events for given event type', () => {
            let actual = 0;

            eventDispatcher.addEventListener(StationEvents.Created, result => actual++);
            eventDispatcher.addEventListener(StationEvents.Updated, result => actual++);

            eventDispatcher.dispatchAll(StationEvents.Updated);

            expect(actual).to.equal(1);
        });

        it('should dispatch all events for given event type', () => {
            let actual = 0;

            eventDispatcher.addEventListener(StationEvents.Created, result => actual++);
            eventDispatcher.addEventListener(StationEvents.Created, result => actual++);

            eventDispatcher.dispatchAll(StationEvents.Created);

            expect(actual).to.equal(2);
        });
    });

});

