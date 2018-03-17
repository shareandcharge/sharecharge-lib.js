import { PlugType } from './plugType';

export class Connector {
    private _fieldChange: object = {};

    private _id: string = "";
    private _plugTypes: PlugType[] = [];
    private _isAvailable: boolean = false;

    resetFieldChanges() {
        ["plugTypes", "isAvailable"].forEach(name => this._fieldChange[name] = false);
    }
}
