export const tokenAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }]

export const usdcAddress = "0x42175C2d49f8a0801d4E955FA144eAB9aC8F189a"
export const usdtAddress = "0xF8A7b0fe30c7e0e73a039ABed21cFee369780e84"
export const ghoAddress = "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60"

export const swapAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "fromToken",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "toToken",
                "type": "address"
            }
        ],
        "name": "swap",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]
export const swapAddress = "0x645e23309beBb72d6c8beE06cA5cFa75Bd973071"