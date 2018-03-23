import { Evse } from '../src/models/evse';
import { PlugType } from '../src/models/plugType';
import { Station } from '../src/models/station';

export class EvseBuilder {

    private owner: string = "0x0000000000000000000000000000000000000000";
    private stationId: string = "0x0000000000000000000000000000000000000000";
    private plugTypes: PlugType[] = [];
    private available: boolean = true;

    withOwner(val: string): EvseBuilder {
        this.owner = val; return this;
    }

    withIsAvailable(val: boolean): EvseBuilder {
        this.available = val; return this;
    }

    withStation(station: Station): EvseBuilder {
        this.stationId = station.id; return this;
    }

    build(): Evse {
        const evse = new Evse();
        evse.owner = this.owner;
        evse.stationId = this.stationId;
        evse.plugTypes = this.plugTypes;
        evse.available = this.available;
        return evse;
    }
}
