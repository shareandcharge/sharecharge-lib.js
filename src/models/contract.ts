import { Wallet } from "./wallet";

export class Contract {

    public readonly address: string;
    public readonly gasPrice: number | undefined;
    public readonly native: any;

    constructor(private web3: any, private config: { abi: any, address: string, gasPrice?: number }) {
        this.address = config.address;
        this.gasPrice = config.gasPrice;
        this.native = new this.web3.eth.Contract(config.abi, config.address);
    }

    async getBlockNumber(): Promise<number> {
        const blockNumber = await this.web3.eth.getBlockNumber();
        return blockNumber;
    }

    async getNonce(wallet: Wallet): Promise<number> {
        const nonce = await this.web3.eth.getTransactionCount(wallet.address);
        return nonce;
    }

    async call(method: string, ...args: any[]): Promise<any> {
        return this.native.methods[method](...args).call();
    }

    async send(method: string, parameters: any[], wallet: Wallet): Promise<any> {
        wallet.nonce = await this.getNonce(wallet);
        const tx = await this.createUnsignedTx(method, parameters, wallet);
        const serializedTx = wallet.sign(tx);
        return this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    }

    async request(method: string, parameters: any[], wallet: Wallet, callback: any = this.requestCallback): Promise<any> {
        const tx = await this.createUnsignedTx(method, parameters, wallet);
        const serializedTx = wallet.sign(tx);
        return this.web3.eth.sendSignedTransaction.request('0x' + serializedTx.toString('hex'), callback);
    }

    newBatch(): any {
        return new this.web3.eth.BatchRequest();
    }

    private async createUnsignedTx(method: string, parameters: any[], wallet: Wallet): Promise<any> {
        const tx = this.native.methods[method](...parameters);
        const gas = await tx.estimateGas({ from: wallet.address }) * 2;
        const data = await tx.encodeABI();
        const nonce = await this.web3.eth.getTransactionCount(wallet.address);
        return {
            nonce: wallet.nonce,
            from: wallet.address,
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