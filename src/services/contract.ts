import Web3 = require('web3');
import {Subject} from 'rxjs/Subject';
import {config} from '../config/config';
import {IContract} from '../models/contract';
import {Request} from '../models/request';
import {Connector} from '../models/connector';
import {Receipt, ReturnStatusObject} from '../models/receipt';
import {createPayload, createReceipt} from '../utils/helpers';

export class Contract implements IContract {

    private web3: Web3;
    private contract: any;
    private personal: any;
    private pass: any;

    private source = new Subject<Request>();

    events$ = this.source.asObservable();

    constructor(pass: string, provider?: string) {
        this.pass = pass;
        this.web3 = new Web3(provider || config.node);
        this.personal = this.web3.eth.personal;

        this.contract = new this.web3.eth.Contract(config.chargeAbi, config.chargeAddr);

        this.contract.events.StartRequested({}, (err, res) => {
            if (err) {
                this.source.error(new Error(err));
            } else {
                this.source.next(createPayload('start', res.returnValues));
            }
        });

        this.contract.events.StopRequested({}, (err, res) => {
            if (err) {
                this.source.error(new Error(err));
            } else {
                this.source.next(createPayload('stop', res.returnValues));
            }
        });
    }

    async getCoinbase() {
        return await this.web3.eth.getCoinbase();
    }

    async queryState(method: string, ...args: any[]): Promise<any> {
        const query = this.contract.methods[method](...args);
        return query.call();
    }

    async sendTx(method: string, ...args: any[]): Promise<Receipt> {
        const coinbase = await this.web3.eth.getCoinbase();
        // console.log('args:', args);
        const tx = this.contract.methods[method](...args);
        // const gas1 = await this.web3.eth.estimateGas({ data: tx.rawTransaction, from: coinbase });
        const gas2 = await tx.estimateGas({from: coinbase});
        await this.personal.unlockAccount(coinbase, this.pass, 30);
        const receipt = await tx.send({from: coinbase, gas: gas2});
        return createReceipt(receipt);
    }

}
