import { encodeFunctionData, parseEther } from "viem";
import { tokenAbi, ghoAddress, usdcAddress, usdtAddress, swapAbi, swapAddress } from "./constants";

const crypto = ['BTC', 'ETH', 'USDC', 'USDT', 'MATIC', 'GHO']
const intents = ['Swap', 'Send', 'Mint']

const isSimilar = (a, b) => {
    const upperA = a.toUpperCase();
    const upperB = b.toUpperCase();

    if (upperA === upperB) return true;

    return false;
}

const intentDecoder = (solution) => {
    let intent = 0;
    const key = Object.keys(solution)[0];
    const value = solution[key];
    intent = value > key ? 1 : 0;
    return intents[intent];
}

const swapTokenizer = (sender, text) => {
    const tokens = text.split(' ');
    const tokenized = [];
    let amount = '';
    let from = ''

    for (let i = 0; i < tokens.length && tokenized.length <= 2; i++) {
        const word = tokens[i];
        if (!isNaN(parseFloat(word))) {
            amount = word;
            if (i + 1 < tokens.length)
                from = tokens[i + 1];
            continue;
        }
        for (let j = 0; j < crypto.length; j++) {
            if (isSimilar(tokens[i], crypto[j]))
                tokenized.push(crypto[j]);
        }
    }

    const to = tokenized.filter((word) => word !== from)[0]

    const data = encodeFunctionData({
        abi: swapAbi,
        args: [sender, from === 'GHO' ? ghoAddress : from === 'USDC' ? usdcAddress : usdtAddress, parseEther(amount.toString()), to === 'GHO' ? ghoAddress : to === 'USDC' ? usdcAddress : usdtAddress]
    })
    const txData = {
        data,
        to: swapAddress,
        value: 0
    }
    const decodedIntent = `You are willing to swap ${amount} ${from} for ${to}`
    return { txData, decodedIntent };
}

const sendTokenizer = (sender, text) => {
    const tokens = text.split(' ');
    let from = ''
    let amount = ''
    let to = ''

    for (let i = 0; i < tokens.length; i++) {
        const word = tokens[i];
        if (word.includes('0x')) {
            to = word;
        }
        else if (!isNaN(parseFloat(word))) {
            amount = word
        }
        for (let j = 0; j < crypto.length; j++) {
            if (isSimilar(tokens[i], crypto[j])) {
                from = crypto[j];
                break;
            }
        }
    }

    const removeStopWords = (text) => {
        const regex = /^[a-zA-Z0-9]+$/;
        const cleanedAddress = text.replace(regex, '');
        return cleanedAddress;
    }

    const address = removeStopWords(to) || '0x6b29615CcDbA6e0e803F808D42e4477324F94D41';

    const data = encodeFunctionData({
        abi: [tokenAbi[1]],
        args: [sender, address, parseEther(amount)]
    })

    const txData = {
        data,
        to: from === 'GHO' ? ghoAddress : from === 'USDC' ? usdcAddress : usdtAddress,
        value: 0
    }
    const decodedIntent = `You are willing to send ${amount} ${from} to address ${to}`
    return { txData, decodedIntent };
}

const mintTokenizer = (text) => { }

const tokenizer = (address, solution, text) => {
    const intent = intentDecoder(solution);
    if (intent === 'Swap') return swapTokenizer(address, text);
    if (intent === 'Send') return sendTokenizer(address, text);
    if (intent === 'Mint') return mintTokenizer(text);
}

export { tokenizer }