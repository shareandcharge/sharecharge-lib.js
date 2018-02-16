import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { IContract } from './models/contract';
import { Command } from './models/command';
import { ReturnStatusObject } from './models/receipt';
import { createStatusObject } from './utils/helpers';

export class ShareAndCharge {

    private contract;

    private startSource = new Subject<Command>();
    private stopSource = new Subject<Command>();

    start$ = this.startSource.asObservable();
    stop$ = this.stopSource.asObservable();

    constructor(contract: IContract) {
        this.contract = contract;
        this.contract.events$.subscribe(
            request => {
                if (request.type === 'start') {
                    this.startSource.next({
                        params: request,
                        success: async () => await this.contract.confirmStart(request.connectorId, request.controller),
                        failure: async () => await this.contract.logError(request.connectorId, 0)
                    });
                } else {
                    this.stopSource.next({
                        params: request,
                        success: async () => await this.contract.confirmStop(request.connectorId),
                        failure: async () => await this.contract.logError(request.connectorId, 1)
                    });
                }
            },
            err => {
                console.log(err);
            });
    }

    async updateStatus(chargePoints: string[], clientId: string): Promise<ReturnStatusObject> {
        const updates = await this.contract.updateStatuses(chargePoints, clientId);
        return createStatusObject(chargePoints, updates);
    }
}