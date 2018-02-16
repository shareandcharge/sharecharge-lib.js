import { ReturnStatusObject } from '../models/receipt';

export const createStatusObject = (expected: string[], actual: any[]): ReturnStatusObject => {
    const status: ReturnStatusObject = { points: [], errors: [] };
    const missing = expected.filter(point => !actual.includes(point));
    if (missing[0]) {
        status.errors.push(Error('Unable to update status of: ' + missing));
    }
    status.points = actual.filter(point => point);
    return status;
};