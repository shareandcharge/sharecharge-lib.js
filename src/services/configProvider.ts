export class ConfigProvider {

    public readonly stage: string;
    public readonly provider: string;
    public readonly gasPrice: number;
    public readonly pollingInterval: number;

    constructor(config: any = {}) {
        this.stage = config.stage || 'local';
        this.provider = config.provider || 'http://localhost:8545';
        this.gasPrice = config.gasPrice || 18000000000;
        this.pollingInterval = config.pollingInterval || 1000;
    }
}
