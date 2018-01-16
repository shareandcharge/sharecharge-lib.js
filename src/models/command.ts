import { Request } from './request';
import { Receipt } from './receipt';

export interface Command {
    params: Request;
    success: () => Promise<Receipt>;
    failure: () => Promise<Receipt>;
}
