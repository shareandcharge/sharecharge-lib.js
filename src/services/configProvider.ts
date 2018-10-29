export class ConfigProvider {

    public readonly stage: string;
    public readonly ethProvider: string;
    public readonly ipfsProvider: { host: string, port: string, protocol: string };
    public readonly gasPrice: number;
    public readonly pollingInterval: number;
    public mspToken: string;

    constructor(config: any = {}) {
        this.stage = config.stage || 'local';
        this.ethProvider = config.ethProvider || 'http://localhost:8545';
        this.ipfsProvider = config.ipfsProvider || {
            host: '127.0.0.1',
            port: '5001',
            protocol: 'http'
        };
        this.gasPrice = config.gasPrice || 18000000000;
        this.pollingInterval = config.pollingInterval || 1000;
        this.mspToken = config.mspToken || "";
    }
}
