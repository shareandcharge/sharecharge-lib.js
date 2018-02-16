export const abi = [
    {
        "inputs": [
            {
                "name": "storageAddress",
                "type": "address"
            },
            {
                "name": "sessionsAddress",
                "type": "address"
            },
            {
                "name": "coinAddress",
                "type": "address"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "clientId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "name": "connectorId",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "name": "controller",
                "type": "address"
            }
        ],
        "name": "StartRequested",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "connectorId",
                "type": "bytes32"
            }
        ],
        "name": "StartConfirmed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "clientId",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "name": "connectorId",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "name": "controller",
                "type": "address"
            }
        ],
        "name": "StopRequested",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "connectorId",
                "type": "bytes32"
            }
        ],
        "name": "StopConfirmed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "connectorId",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "name": "errorCode",
                "type": "uint8"
            }
        ],
        "name": "Error",
        "type": "event"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "connectorId",
                "type": "bytes32"
            }
        ],
        "name": "requestStart",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "connectorId",
                "type": "bytes32"
            },
            {
                "name": "controller",
                "type": "address"
            }
        ],
        "name": "confirmStart",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "connectorId",
                "type": "bytes32"
            }
        ],
        "name": "requestStop",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "connectorId",
                "type": "bytes32"
            }
        ],
        "name": "confirmStop",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "connectorId",
                "type": "bytes32"
            }
        ],
        "name": "isAvailable",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "clientId",
                "type": "bytes32"
            },
            {
                "name": "connectorId",
                "type": "bytes32"
            },
            {
                "name": "_isAvailable",
                "type": "bool"
            }
        ],
        "name": "setAvailability",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "connectorId",
                "type": "bytes32"
            },
            {
                "name": "errorCode",
                "type": "uint8"
            }
        ],
        "name": "logError",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];