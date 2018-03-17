export class EventDispatcher<TEvent> {

    private eventHandlers = new Map<TEvent, any>();

    public addEventListener(theEvent: TEvent, theHandler: any) {
        if (!this.eventHandlers.has(theEvent)) this.eventHandlers.set(theEvent, []);
        this.eventHandlers.get(theEvent).push(theHandler);
    }

    public removeAllListeners(theEvent: TEvent) {
        this.eventHandlers.delete(theEvent);
    }

    public dispatchAll(theEvent: TEvent, ...args: any[]) {
        if (this.eventHandlers.has(theEvent)) {
            this.eventHandlers.get(theEvent).forEach(element => element(...args));
        }
    }

}