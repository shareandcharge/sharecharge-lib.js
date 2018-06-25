import { ITariff } from "@motionwerk/sharecharge-common/dist/common";
import { TariffElement } from "./tariffElement";

export class Tariff {

    id: string;
    currency: string;
    elements: TariffElement[];
    last_updated: string;

    constructor() {
        this.id = '';
        this.currency = '';
        this.elements = [];
        this.last_updated = new Date().toISOString();
    }

    public get energyRates(): TariffElement[] {
        return this.elements.filter(element => element.priceComponents.type === 'ENERGY');
    }

    public get timeRates(): TariffElement[] {
        return this.elements.filter(element => element.priceComponents.type === 'TIME');
    }

    public get flatRates(): TariffElement[] {
        return this.elements.filter(element => element.priceComponents.type === 'FLAT');
    }

    static deserialize(tariffs: ITariff[]): { [key: string]: Tariff } {
        const deserializedTariffs: { [key: string]: Tariff } = {};
        for (const tariff of tariffs) {
            const tariffObject = new Tariff();
            tariffObject.id = tariff.id;
            tariffObject.currency = tariff.currency;
            tariffObject.elements = TariffElement.deserialize(tariff.elements);
            deserializedTariffs[tariff.id] = tariffObject;
        }
        return deserializedTariffs;
    }

}