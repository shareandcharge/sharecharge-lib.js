export class TariffElement {
    priceComponents: {
        type: string;
        price: number;
        stepSize: number;
    };
    restrictions: {
        startTime?: string;
        endTime?: string;
        startDate?: string;
        endDate?: string;
        minKwh?: number;
        maxKwh?: number;
        minPower?: number;
        maxPower?: number;
        minDuration?: number;
        maxDuration?: number;
        dayOfWeek?: string;
    };

    constructor() {
        this.priceComponents = {
            type: '',
            price: 0,
            stepSize: 0
        };
        this.restrictions = {};
    }

    static deserialize(elements: any[]): TariffElement[] {
        const tariffElements: TariffElement[] = [];
        for (const element of elements) {
            const tariffElement = new TariffElement();
            tariffElement.priceComponents = element['price_components'][0];
            tariffElement.restrictions = element.restrictions || {};
            tariffElements.push(tariffElement);
        }
        return tariffElements;
    }
}