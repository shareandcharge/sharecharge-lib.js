import { ConnectorType } from './connectorType';
import { PowerType } from './powerType';
import { Evse } from './evse';
import { ToolKit } from './../utils/toolKit';

export class Connector {
    private _id: string = ToolKit.randomBytes32String();
    private _owner: string = "0x0000000000000000000000000000000000000000";
    private _evseId: String = "0x0000000000000000000000000000000000000000";
    private _standard: ConnectorType = ConnectorType.CHADEMO;
    private _powerType: PowerType = PowerType.AC_1_PHASE;
    private _voltage: number = 0;
    private _amperage: number = 0;

    get id(): string {
        return this._id;
    }

    get owner(): string {
        return this._owner;
    }

    get evseId(): String {
        return this._evseId;
    }

    set evseId(value: String) {
        this._evseId = value;
    }

    get standard(): ConnectorType {
        return this._standard;
    }

    set standard(value: ConnectorType) {
        this._standard = value;
    }

    get powerType(): PowerType {
        return this._powerType;
    }

    set powerType(value: PowerType) {
        this._powerType = value;
    }

    get voltage(): number {
        return this._voltage;
    }

    set voltage(value: number) {
        if (value < 0) return;
        this._voltage = value;
    }

    get amperage(): number {
        return this._amperage;
    }

    set amperage(value: number) {
        if (value < 0) return;
        this._amperage = value;
    }

    static deserialize(payload: any): Connector {
        const connector = new Connector();
        connector._id = payload["id"];
        connector._owner = payload["owner"];
        connector._evseId = payload["evseId"];
        connector._standard = payload["standard"];
        connector._powerType = payload["powerType"];
        connector._voltage = parseInt(payload["voltage"]);
        connector._amperage = parseInt(payload["amperage"]);
        return connector;
    }
}