import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { IContract } from '../src/models/contract';
import { Receipt } from '../src/models/receipt';
import { Request } from '../src/models/request';

export class TestContract implements IContract {

    private testSource = new Subject<Request>();

    events$ = this.testSource.asObservable();

    emitStart(pole: string, user: string) {
        this.testSource.next({
            type: 'start',
            pole: pole,
            user: user
        });
    }

    emitStop(pole: string, user: string) {
        this.testSource.next({
            type: 'stop',
            pole: pole,
            user: user
        });
    }

    confirmStart(request: Request): Promise<Receipt> {
        return Promise.resolve({
            status: 'start status',
            txHash: '0x11',
            blockNumber: 696969
        });
    }

    confirmStop(request: Request): Promise<Receipt> {
        return Promise.resolve({
            status: 'stop status',
            txHash: '0x22',
            blockNumber: 700131
        });
    }

    sendError(request: Request): Promise<Receipt> {
        return Promise.resolve({
            status: 'error status',
            txHash: '0x33',
            blockNumber: 78002
        });
    }

}
