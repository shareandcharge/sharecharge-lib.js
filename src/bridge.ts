import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { IContract } from './models/contract';
import { Command } from './models/command';

export class Bridge {

    private startSource = new Subject<Command>();
    private stopSource = new Subject<Command>();

    start$ = this.startSource.asObservable();
    stop$ = this.stopSource.asObservable();

    constructor(contract: IContract) {
        contract.events$.subscribe(
            request => {
                if (request.type === 'start') {
                    this.startSource.next({
                        params: request,
                        success: async () => await contract.confirmStart(request),
                        failure: async () => await contract.sendError(request)
                    });
                } else {
                    this.stopSource.next({
                        params: request,
                        success: async () => await contract.confirmStop(request),
                        failure: async () => await contract.sendError(request)
                    });
                }
            },
            err => {
                console.log(err);
            });
    }
}