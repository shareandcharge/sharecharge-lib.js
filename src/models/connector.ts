import { PlugType } from './plugType';
import { ChangeTracker } from './changeTracker';
import { ToolKit } from '../utils/toolKit';

export class Connector {

    public readonly tracker: ChangeTracker;

    private _id: string = ToolKit.randomBytes32String();
    private _owner: string = "0x0000000000000000000000000000000000000000";
    private _stationId: string = "0x0000000000000000000000000000000000000000";
    private _plugTypes: PlugType[] = [];
    private _available: boolean = false;

    constructor() {
        this.tracker = new ChangeTracker(this);
    }

    get id(): string {
        return this._id;
    }

    get owner(): string {
        return this._owner;
    }

    set owner(value: string) {
        value = value.toLowerCase();
        if (ToolKit.isAddress(value)) {
            this.tracker.setProperty("owner", value);
        }
    }

    get stationId(): string {
        return this._stationId;
    }

    set stationId(value: string) {
        this.tracker.setProperty("stationId", value);
    }

    get plugTypes(): PlugType[] {
        return this._plugTypes;
    }

    set plugTypes(value: PlugType[]) {
        this.tracker.setProperty("plugTypes", value);
    }

    get available(): boolean {
        return this._available;
    }

    set available(value: boolean) {
        this.tracker.setProperty("available", value);
    }

    static deserialize(payload: any): Connector {
        const connector = new Connector();
        connector._id = payload["id"];
        connector._owner = payload["owner"];
        connector._stationId = payload["stationId"];
        connector._plugTypes = ToolKit.fromPlugMask(payload["plugMask"]);
        connector._available = payload["available"];
        return connector;
    }
}
