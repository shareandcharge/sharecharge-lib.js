import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { IContract } from './models/contract';
import { Command } from './models/command';
import { Connector } from './models/connector';
import { Receipt } from './models/receipt';
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
                        success: async () => await this.confirmStart(request.connectorId, request.controller),
                        failure: async () => await this.logError(request.connectorId, 0)
                    });
                } else {
                    this.stopSource.next({
                        params: request,
                        success: async () => await this.confirmStop(request.connectorId),
                        failure: async () => await this.logError(request.connectorId, 1)
                    });
                }
            },
            err => {
                console.log(err);
            });
    }

    async registerConnector(conn: Connector, clientId: string): Promise<Receipt> {
        const parameters = [
            conn.id,
            clientId,
            conn.owner,
            conn.lat,
            conn.lng,
            conn.price,
            conn.model,
            conn.plugType,
            conn.openingHours,
            conn.isAvailable
        ];
        return this.contract.sendTx('registerConnector', ...parameters);
    }

    async setUnavailable(connectorId: string, clientId: string): Promise<Receipt | undefined> {
        const available = await this.contract.queryState('isAvailable', connectorId);
        if (available) {
            return this.contract.sendTx('setAvailability', clientId, connectorId, false);
        }
    }

    async requestStart(connectorId: string, secondsToRent: number): Promise<Receipt> {
        const params = Array.from(arguments);
        return this.contract.sendTx('requestStart', ...params);
    }

    async confirmStart(connectorId: string, controller: string): Promise<Receipt> {
        const params = Array.from(arguments);
        return this.contract.sendTx('confirmStart', ...params);
    }

    async confirmStop(connectorId: string): Promise<Receipt> {
        const params = Array.from(arguments);
        return this.contract.sendTx('confirmStop', ...params);
    }

    async logError(connectorId: string, errorCode: number): Promise<Receipt> {
        const params = Array.from(arguments);
        return this.contract.sendTx('logError', ...params);
    }

}