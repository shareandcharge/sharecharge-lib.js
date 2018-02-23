import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { IContract } from '../src/models/contract';
import { Receipt, ReturnStatusObject } from '../src/models/receipt';
import { Request } from '../src/models/request';

export class TestContract implements IContract {

    private testSource = new Subject<Request>();

    events$ = this.testSource.asObservable();

    emitStart(clientId: string, connectorId: string, controller: string) {
        this.testSource.next({
            type: 'start',
            clientId,
            connectorId,
            controller
        });
    }

    emitStop(clientId: string, connectorId: string, controller: string): void {
        this.testSource.next({
            type: 'stop',
            clientId,
            connectorId,
            controller
        });
    }

    async sendTx(method: string, ...args: any[]): Promise<Receipt> {
        return {
            status: 'status',
            txHash: '0xTxHash',
            blockNumber: 55
        };
    }

    async queryState(method: string, ...args: any[]): Promise<any> {
        return true;
    }

}
