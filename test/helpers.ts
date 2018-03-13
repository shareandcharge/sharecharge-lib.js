export class Stub {

    sandbox;
    api;

    constructor(sandbox, api) {
        this.sandbox = sandbox;
        this.api = api;
    }

    resolves(method: string, response: any, ...args): void {
        this.sandbox.stub(this.api, method)
            .withArgs(...args)
            .resolves(response);
    }

}