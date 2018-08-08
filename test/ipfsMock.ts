const location = require('./data/ocpiLocation.json');
const tariffs = require('./data/ocpiTariffs.json');

export default {
    obtain(): any {
        return {
            add: async (content: any) => {
                // if location, else tariffs
                if (content.evses) {
                    return {
                        ipfs: 'QmUVB2FKuQ66s5Fueu6BBX5Nsxf1eVXcif5dq3qPKeRFLj',
                        solidity: '0x5b550af4e10a5631201589b74703d5d2217efbfadc4a8816eee55696f3b4cc40'
                    };
                } else {
                    return {
                        ipfs: 'QmcZDo3C8z22MiJhtRAEutDSshzWxVXPRc59EtvG3aa7kn',
                        solidity: '0xd33bfefcce08f899aa9f8d16447620dffcfb63b3d95dfefe056515411f8d917b'
                    };
                }

            },
            cat: async (hash: string) => {
                return hash === '0x5b550af4e10a5631201589b74703d5d2217efbfadc4a8816eee55696f3b4cc40' ? location : tariffs;
            }
        };
    }
};
