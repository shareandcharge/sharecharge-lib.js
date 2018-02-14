export interface Receipt {
    status: string;
    txHash: string;
    blockNumber: number;
}

export interface ReturnStatusObject {
    points: Receipt[];
    errors: Error[];
}
