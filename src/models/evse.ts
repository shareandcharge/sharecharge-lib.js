import { PlugType } from './plugType';
import { ChangeTracker } from './changeTracker';
import { ToolKit } from '../utils/toolKit';

export class Evse {

    public readonly tracker: ChangeTracker;

    private _id: string = ToolKit.randomBytes32String();
    private _owner: string = "0x0000000000000000000000000000000000000000";
    private _stationId: string = "0x0000000000000000000000000000000000000000";
    private _plugMask: number = 0;
    private _available: boolean = true;

    constructor() {
        this.tracker = new ChangeTracker(this);
    }

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
        this.tracker.setProperty("stationId", value);
    }

    get plugTypes(): PlugType[] {
        return ToolKit.fromPlugMask(this._plugMask);
    }

    set plugTypes(value: PlugType[]) {
        this.tracker.setProperty("plugMask", ToolKit.toPlugMask(value));
    }

    get available(): boolean {
        return this._available;
    }

    set available(value: boolean) {
        this.tracker.setProperty("available", value);
    }

    static deserialize(payload: any): Evse {
        const evse = new Evse();
        evse._id = payload["id"];
        evse._owner = payload["owner"];
        evse._stationId = payload["stationId"];
        evse._plugMask = payload["plugMask"];
        evse._available = payload["available"];
        return evse;
    }
}
