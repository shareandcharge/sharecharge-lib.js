import { Connector } from '../src/models/connector';
import { PlugType } from '../src/models/plugType';
import { Station } from '../src/models/station';

export class ConnectorBuilder {

    private owner: string = "0x0000000000000000000000000000000000000000";
    private stationId: string = "0x0000000000000000000000000000000000000000";
    private plugTypes: PlugType[] = [];
    private available: boolean = true;

    withOwner(val: string): ConnectorBuilder {
        this.owner = val; return this;
    }

    withIsAvailable(val: boolean): ConnectorBuilder {
        this.available = val; return this;
    }

    withStation(station: Station): ConnectorBuilder {
        this.stationId = station.id; return this;
    }

    build(): Connector {
        const connector = new Connector();
        connector.owner = this.owner;
        connector.stationId = this.stationId;
        connector.plugTypes = this.plugTypes;
        connector.available = this.available;
        return connector;
    }
}