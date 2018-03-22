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

    async call(method: string, ...args: any[]): Promise<any> {
        return this.native.methods[method](...args).call();
    }

    async send(method: string, wallet: Wallet, ...args: any[]): Promise<any> {
        const tx = await this.createTx(method, wallet, ...args);
        const serializedTx = wallet.sign(tx);
        return this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    }

    private async createTx(method: string, wallet: Wallet, ...args: any[]): Promise<any> {
        const tx = this.native.methods[method](...args);
        const gas = await tx.estimateGas({from: wallet.address}) * 2;
        // console.log(gas, this.gasPrice);
        const data = await tx.encodeABI();
        const nonce = await this.web3.eth.getTransactionCount(wallet.address);
        return {
            nonce,
            from: wallet.address,
            to: this.address,
            gasPrice: this.gasPrice,
            gas,
            value: 0,
            data
        };
    }

}