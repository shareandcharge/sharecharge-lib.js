import { Observable } from 'rxjs/Observable';
import { Receipt } from './receipt';
import { Request } from './request';

export interface IContract {

    readonly events$: Observable<Request>;

    createTxData(method: string, ...args: any[]): Promise<string>;

    queryState(method: string, ...args: any[]): Promise<any>;

    sendTx(method: string, ...args: any[]): Promise<Receipt>;

}
