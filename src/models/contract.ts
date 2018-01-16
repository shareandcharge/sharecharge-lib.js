import { Observable } from 'rxjs/Observable';
import { Receipt } from './receipt';
import { Request } from './request';

export interface IContract {

    readonly events$: Observable<Request>;

    confirmStart(request: Request): Promise<Receipt>;

    confirmStop(request: Request): Promise<Receipt>;

    sendError(request: Request): Promise<Receipt>;
}
