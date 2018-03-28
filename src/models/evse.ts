import { PlugType } from './plugType';
import { ToolKit } from '../utils/toolKit';

export class Evse {
    private _id: string = ToolKit.randomBytes32String();
    private _owner: string = "0x0000000000000000000000000000000000000000";
    private _stationId: string = "0x0000000000000000000000000000000000000000";
    private _currency: string = ToolKit.asciiToHex("EUR");
    private _basePrice: number = 0;
    private _tariffId: number = 0;
    private _available: boolean = true;

    get id(): string {
        return this._id;
    }

    get owner(): string {
        return this._owner;
    }

    get stationId(): string {
        return this._stationId;
    }

    set stationId(value: string) {
        this._stationId = value;
    }

    get currency(): string {
        return this._currency;
    }

    set currency(value: string) {
        if (value.length === 3) {
            this._currency = ToolKit.asciiToHex(value);
        }
    }

    get basePrice(): number {
        return this._basePrice;
    }

    set basePrice(value: number) {
        this._basePrice = value;
    }

    get tariffId(): number {
        return this._tariffId;
    }

    set tariffId(value: number) {
        this._tariffId = value;
    }

    get available(): boolean {
        return this._available;
    }

    set available(value: boolean) {
        this._available = value;
    }

    static deserialize(payload: any): Evse {
        const evse = new Evse();
        evse._id = payload["id"];
        evse._owner = payload["owner"];
        evse._stationId = payload["stationId"];
        evse._currency = payload["currency"];
        evse._basePrice = payload["basePrice"];
        evse._tariffId = payload["tariffId"];
        evse._available = payload["available"];
        return evse;
    }
}
