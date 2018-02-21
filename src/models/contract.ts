import { Observable } from 'rxjs/Observable';
import { Receipt } from './receipt';
import { Request } from './request';

export interface IContract {

    readonly events$: Observable<Request>;

}
