export class Uhr {

    private fromIndex = 0;
    private toIndex = 96;

    get from(): string {
        const hours = (this.fromIndex * 15) / 60 << 0;
        const minutes = (this.fromIndex * 15) % 60;
        return this.pad(hours) + ':' + this.pad(minutes);
    }

    get to(): string {
        const hours = (this.toIndex * 15) / 60 << 0;
        const minutes = (this.toIndex * 15) % 60;
        return this.pad(hours) + ':' + this.pad(minutes);
    }

    set(from: string, to: string) {
        const [fromHour, fromMinutes] = from.split(':').map(x => Number.parseInt(x));
        this.fromIndex = fromHour * 4 + fromMinutes / 15;

        const [toHour, toMinutes] = to.split(':').map(x => Number.parseInt(x));
        this.toIndex = toHour * 4 + toMinutes / 15;

        if (this.fromIndex > this.toIndex) {
            this.fromIndex = this.toIndex;
        }
    }

    encode(): string {
        return this.pad(this.fromIndex) + this.pad(this.toIndex);
    }

    decode(val: string): boolean {
        this.fromIndex = Number.parseInt(val[0] + val[1]);
        this.toIndex = Number.parseInt(val[2] + val[3]);
        return !(Number.isNaN(this.fromIndex) || Number.isNaN(this.toIndex));
    }

    private pad(val: any) {
        return (val.toString().length < 2 ? "0" : "") + val.toString();
    }

}

export class OpeningHours {

    private data = [new Uhr(), new Uhr(), new Uhr(), new Uhr(), new Uhr(), new Uhr(), new Uhr()];

    constructor() {
    }

    get monday() {
        return this.data[0];
    }

    get tuesday() {
        return this.data[1];
    }

    get wednesday() {
        return this.data[2];
    }

    get thursday() {
        return this.data[3];
    }

    get friday() {
        return this.data[4];
    }

    get saturday() {
        return this.data[5];
    }

    get sunday() {
        return this.data[6];
    }

    toString(): string {
        return this.data.map(x => x.encode()).reduce((prev, curr) => prev + curr, "");
    }

    static deserialize(val: string): OpeningHours {
        const result = new OpeningHours();
        if (val.length === 28) {
            for (let i = 0; i < 7; i++) {
                if (!result.data[i].decode(val.substr(i * 4, 4))) {
                    result.data[i].set('00:00', '24:00');
                }
            }
        }
        return result;
    }
}