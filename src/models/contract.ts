import { Observable } from 'rxjs/Observable';
import { Receipt } from './receipt';
import { Request } from './request';

export interface IContract {

    readonly events$: Observable<Request>;

    queryState(method: string, ...args: any[]): Promise<any>;

    sendTx(method, ...args: any[]): Promise<Receipt>;

}
