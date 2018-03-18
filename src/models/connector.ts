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

    get stationId(): string {
        return this._stationId;
    }

    get plugTypes(): PlugType[] {
        return this._plugTypes;
    }

    get available(): boolean {
        return this._available;
    }

    static deserialize(payload: any): Connector {
        const station = new Connector();
        station._id = payload["id"];
        station._owner = payload["owner"];
        station._stationId = payload["stationId"];
        station._plugTypes = this.fromPlugMask(payload["plugMask"]);
        station._available = payload["available"];
        return station;
    }

    static fromPlugMask(mask: number): PlugType[] {
        let plugs: PlugType[] = [];
        for (let bit = 0; bit < 16; bit++) {
            let flag = (mask >> bit) & 0x01;
            if (flag) {
                plugs.push(flag << bit);
            }
        }
        return plugs;
    }

}
