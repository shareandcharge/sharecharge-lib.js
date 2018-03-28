export interface IConfigProvider {
    readonly stage: string;
    readonly provider: string;
    readonly gasPrice: number;
    readonly pollingInterval: number;
}
