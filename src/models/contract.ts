import {Observable} from 'rxjs/Observable';
import {Receipt} from './receipt';
import {Request} from './request';

export interface IContract {

    readonly events$: Observable<Request>;

    confirmStart(connectorId: string, controller: string): Promise<Receipt>;

    confirmStop(connectorId: string): Promise<Receipt>;

    queryState(method: string, ...args: any[]): Promise<Receipt>;

    logError(connectorId: string, errorCode: number): Promise<Receipt>;
}
