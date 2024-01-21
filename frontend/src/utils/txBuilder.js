import { bundlerActions, getSenderAddress, signUserOperationHashWithECDSA } from "permissionless"
import { pimlicoBundlerActions, pimlicoPaymasterActions } from "permissionless/actions/pimlico"
import { concat, createClient, createPublicClient, encodeFunctionData, http } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { sepolia, polygonMumbai } from "viem/chains"

const txBuilder = async ({ chainId, to, value, data }) => {
    const chain = chainId === 11155111 ? "sepolia" : chainId === 80001 ? "polygon" : null
    const resolver = chain => {
        if (chainId === 11155111) return [sepolia, chainId, "https://1rpc.io/sepolia"]
        else if (chainId === 80001) return [polygonMumbai, chainId, "https://rpc.ankr.com/polygon_mumbai"]
    }

    const publicClient = createPublicClient({
        transport: http(resolver(chain)[2]),
        chain: resolver(chain)[0]
    })

    const apiKey = "4c3853a3-69ec-4fb1-ba2b-8da87496c874" // REPLACE THIS

    const bundlerClient = createClient({
        transport: http(`https://api.pimlico.io/v1/${chain}/rpc?apikey=${apiKey}`),
        chain: resolver(chain)[0]
    }).extend(bundlerActions).extend(pimlicoBundlerActions)

    const paymasterClient = createClient({
        transport: http(`https://api.pimlico.io/v2/${chain}/rpc?apikey=${apiKey}`),
        chain: resolver(chain)[0]
    }).extend(pimlicoPaymasterActions)

    const pkey = generatePrivateKey()
    const owner = privateKeyToAccount(pkey)
    const initCode = concat([
        "0x9406Cc6185a346906296840746125a0E44976454",
        encodeFunctionData({
            abi: [{
                inputs: [{ name: "owner", type: "address" }, { name: "salt", type: "uint256" }],
                name: "createAccount",
                outputs: [{ name: "ret", type: "address" }],
                stateMutability: "nonpayable",
                type: "function",
            }],
            args: [owner.address, 0n]
        })
    ])

    const sender = await getSenderAddress(publicClient, {
        initCode,
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
    })

    const callData =
        encodeFunctionData({
            abi: [
                {
                    inputs: [
                        { name: "dest", type: "address" },
                        { name: "value", type: "uint256" },
                        { name: "func", type: "bytes" }
                    ],
                    name: "execute",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function"
                }
            ],
            args: [to, value, data]
        })

    const gasPrice = await bundlerClient.getUserOperationGasPrice()
    gasPrice["high"] = {
        suggestedMaxFeePerGas: gasPrice.fast.maxFeePerGas.toString() / 10 ** 9,
        suggestedMaxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas.toString() / 10 ** 9
    }

    const userOperation = {
        sender,
        nonce: 0n,
        initCode,
        callData,
        maxFeePerGas: gasPrice.high.suggestedMaxFeePerGas * 10 ** 9,
        maxPriorityFeePerGas: gasPrice.high.suggestedMaxPriorityFeePerGas * 10 ** 9,
        // dummy signature, needs to be there so the SimpleAccount doesn't immediately revert because of invalid signature length
        signature: "0xa15569dd8f8324dbeabf8073fdec36d4b754f53ce5901e283c6de79af177dc94557fa3c9922cd7af2a96ca94402d35c39f266925ee6407aeb32b31d76978d4ba1c"
    }

    const sponsorUserOperationResult = await paymasterClient.sponsorUserOperation({
        userOperation,
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
    })

    const sponsoredUserOperation = {
        ...userOperation,
        preVerificationGas: sponsorUserOperationResult.preVerificationGas,
        verificationGasLimit: sponsorUserOperationResult.verificationGasLimit,
        callGasLimit: sponsorUserOperationResult.callGasLimit,
        paymasterAndData: sponsorUserOperationResult.paymasterAndData
    }

    const signature = await signUserOperationHashWithECDSA({
        account: owner,
        userOperation: sponsoredUserOperation,
        chainId: resolver(chain)[0].id,
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
    })
    sponsoredUserOperation.signature = signature

    const userOperationHash = await bundlerClient.sendUserOperation({
        userOperation: sponsoredUserOperation,
        entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
    })

    const receipt = await bundlerClient.waitForUserOperationReceipt({ hash: userOperationHash })

    const txHash = receipt.receipt.transactionHash
    return txHash
}

export default txBuilder;