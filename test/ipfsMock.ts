const location = require('./data/ocpiLocation.json');

export default {
    obtain(): any {
        return {
            add: async (content: any) => {
                return {
                    ipfs: 'QmUVB2FKuQ66s5Fueu6BBX5Nsxf1eVXcif5dq3qPKeRFLj',
                    solidity: '0x5b550af4e10a5631201589b74703d5d2217efbfadc4a8816eee55696f3b4cc40'
                };
            },
            cat: async (hash: string) => { return location; }
        };
    }
};
