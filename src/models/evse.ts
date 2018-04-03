import { ToolKit } from '../utils/toolKit';
import { Tariff } from './tariff';

export class Evse {
    private _id: string = ToolKit.randomBytes32String();
    private _uid: string = "";
    private _owner: string = "0x0000000000000000000000000000000000000000";
    private _stationId: string = "0x0000000000000000000000000000000000000000";
    private _currency: string = "EUR";
    private _basePrice: number = 0;
    private _tariffId: number = Tariff.FLAT;
    private _available: boolean = true;

    get id(): string {
        return this._id;
    }

    get uid(): string {
        return this._uid;
    }

    set uid(value: string) {
        this._uid = value;
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
            this._currency = value;
        }
    }

    get basePrice(): number {
        return this._basePrice;
    }

    set basePrice(value: number) {
        this._basePrice = value * 100;
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
        evse._uid = ToolKit.hexToString(payload["uid"]);
        evse._owner = payload["owner"];
        evse._stationId = payload["stationId"];
        evse._currency = ToolKit.hexToString(payload["currency"]);
        evse._basePrice = payload["basePrice"] / 100;
        evse._tariffId = payload["tariffId"];
        evse._available = payload["available"];
        return evse;
    }
}
