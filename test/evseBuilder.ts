import { Evse } from '../src/models/evse';
import { PlugType } from '../src/models/plugType';
import { Station } from '../src/models/station';
import { ToolKit } from '../src/utils/toolKit';

export class EvseBuilder {

    private stationId: string = "0x0000000000000000000000000000000000000000";
    private currency: string = "EUR";
    private basePrice: number = 0;
    private tariffId: number = 1;
    private available: boolean = true;

    withIsAvailable(val: boolean): EvseBuilder {
        this.available = val; return this;
    }

    withStation(station: Station): EvseBuilder {
        this.stationId = station.id; return this;
    }

    withCurrency(val: string): EvseBuilder {
        this.currency = val; return this;
    }

    withBasePrice(val: number): EvseBuilder {
        this.basePrice = val; return this;
    }

    withTariff(val: number): EvseBuilder {
        this.tariffId = val; return this;
    }

    build(): Evse {
        const evse = new Evse();
        evse.stationId = this.stationId;
        evse.currency = this.currency;
        evse.basePrice = this.basePrice;
        evse.tariffId = this.tariffId;
        evse.available = this.available;
        return evse;
    }
}
