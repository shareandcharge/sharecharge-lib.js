import { Observable } from 'rxjs/Observable';
import { Receipt } from './receipt';
import { Request } from './request';

export interface IContract {

    readonly events$: Observable<Request>;

    createTx(method: string, ...args: any[]): Promise<any>;

    queryState(method: string, ...args: any[]): Promise<any>;

    sendTx(method: string, ...args: any[]): Promise<Receipt>;

}
