import { PlugType } from './plugType';
import { ToolKit } from '../utils/toolKit';

export class Evse {
    private _id: string = ToolKit.randomBytes32String();
    private _owner: string = "0x0000000000000000000000000000000000000000";
    private _stationId: string = "0x0000000000000000000000000000000000000000";
    private _plugMask: number = 0;
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

    get plugTypes(): PlugType[] {
        return ToolKit.fromPlugMask(this._plugMask);
    }

    set plugTypes(value: PlugType[]) {
        this._plugMask = ToolKit.toPlugMask(value);
    }

    get available(): boolean {
        return this._available;
    }

    set available(value: boolean) {
        this._available = value;
    }

    static deserialize(payload: any): Evse {
        const evse = new Evse();
        evse._id = payload["id"] || evse._id;
        evse._owner = payload["owner"] || evse._owner;
        evse._stationId = payload["stationId"] || evse._stationId;
        evse._plugMask = payload["plugMask"] || evse._plugMask;
        evse._available = payload["available"] || evse._available;
        return evse;
    }
}
