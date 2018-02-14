import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { IContract } from '../src/models/contract';
import { Receipt } from '../src/models/receipt';
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

    confirmStart(connectorId: string, controller: string): Promise<Receipt> {
        return Promise.resolve({
            status: 'start status',
            txHash: '0x11',
            blockNumber: 696969,
            request: { connectorId, controller }
        });
    }

    confirmStop(connectorId: string): Promise<Receipt> {
        return Promise.resolve({
            status: 'stop status',
            txHash: '0x22',
            blockNumber: 700131,
            request: { connectorId }
        });
    }

    logError(connectorId: string, errorCode: number): Promise<Receipt> {
        return Promise.resolve({
            status: 'error status',
            txHash: '0x33',
            blockNumber: 78002,
            request: { connectorId, errorCode }
        });
    }

    sendTx(point: string): Promise<any> {
        return Promise.resolve({
            txHash: '0x123',
            blockNumber: 55
        });
    }

    async conflictingStatuses(chargePoints: string[]): Promise<string[]> {
        const conflicts: string[] = [];
        chargePoints.forEach(async point => {
            if (point === '123') {
                conflicts.push(point);
            }
        });
        return conflicts;
    }

    updateStatus(chargePoints: string[]): Promise<any> {
        return Promise.all(chargePoints.map(this.sendTx));
    }

}
