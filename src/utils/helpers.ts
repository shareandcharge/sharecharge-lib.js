import { Receipt, ReturnStatusObject } from '../models/receipt';
import { Request } from '../models/request';

export const createStatusObject = (expected: string[], actual: any[]): ReturnStatusObject => {
    const status: ReturnStatusObject = { points: [], errors: [] };
    const missing = expected.filter(point => !actual.includes(point));
    if (missing[0]) {
        status.errors.push(Error('Unable to update status of: ' + missing));
    }
    status.points = actual.filter(point => point);
    return status;
};

export const createReceipt = (txObject): Receipt => {
    return {
        status: 'mined',
        txHash: txObject.transactionHash,
        blockNumber: txObject.blockNumber
    };
};

export const createPayload = (type, values): Request => {
    return {
        type,
        values
    };
};