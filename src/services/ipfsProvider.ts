import * as ipfsApi from 'ipfs-http-client';
import { Ipfs } from '../models/ipfs';
import { ConfigProvider } from './configProvider';

export class IpfsProvider {

    ipfs: ipfsApi;

    constructor(private config: ConfigProvider) {
        this.ipfs = new ipfsApi(config.ipfsProvider);
    }

    obtain(): Ipfs {
        return new Ipfs(this.ipfs);
    }
}