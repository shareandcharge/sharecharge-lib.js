import { Key } from "./key";

export class Contract {

    public readonly address: string;
    public readonly gasPrice: number | undefined;
    public readonly native: any;

    constructor(private web3: any, private config: { abi: any, address: string, gasPrice?: number }) {
        this.address = config.address;
        this.gasPrice = config.gasPrice;
        this.native = new this.web3.eth.Contract(config.abi, config.address);
    }

    async getNonce(key: Key): Promise<number> {
        const nonce = await this.web3.eth.getTransactionCount(key.address);
        return nonce;
    }

    async getBalance(key: Key): Promise<number> {
        return this.web3.eth.getBalance(key.address);
    }

    async getLogs(eventName: string, filter = {}, fromBlock = 0): Promise<any[]> {
        let logs = await this.native.getPastEvents(eventName, { fromBlock });
        for (const [key, value] of Object.entries(filter)) {
            logs = logs.filter(log => log.returnValues[key].toLowerCase() === value);
        }
        return logs;
    }

    async call(method: string, ...args: any[]): Promise<any> {
        return this.native.methods[method](...args).call();
    }

    async send(method: string, parameters: any[], key: Key): Promise<any> {
        key.nonce = await this.getNonce(key);
        const tx = await this.createUnsignedTx(method, parameters, key);
        const serializedTx = key.sign(tx);
        return this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    }

    async request(method: string, parameters: any[], key: Key, callback: any = this.requestCallback): Promise<any> {
        const tx = await this.createUnsignedTx(method, parameters, key);
        const serializedTx = key.sign(tx);
        return this.web3.eth.sendSignedTransaction.request('0x' + serializedTx.toString('hex'), callback);
    }

    newBatch(): any {
        return new this.web3.eth.BatchRequest();
    }

    private async createUnsignedTx(method: string, parameters: any[], key: Key): Promise<any> {
        const tx = this.native.methods[method](...parameters);
        const gas = await tx.estimateGas({ from: key.address }) * 2;
        const data = await tx.encodeABI();
        const nonce = await this.web3.eth.getTransactionCount(key.address);
        return {
            nonce: key.nonce,
            from: key.address,
            to: this.address,
            gasPrice: this.gasPrice,
            gas,
            value: 0,
            data
        };
    }

    private requestCallback(err, res) {
        if (err) {
            throw Error(err.message);
        }
    }

}