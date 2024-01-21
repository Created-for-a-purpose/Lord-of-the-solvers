const crypto = ['BTC', 'ETH', 'USDC', 'USDT', 'MATIC', 'GHO']
const intents = ['Swap', 'Send', 'Mint']

const isSimilar = (a, b) => {
    const upperA = a.toUpperCase();
    const upperB = b.toUpperCase();

    if (upperA === upperB) return true;

    return false;
}

const intentDecoder = (solution) => {
    let intent = 0
    for (let i = 0; i < solution.length; i++) {
        if (solution[i] > solution[intent]) {
            intent = i;
        }
    }
    return intents[intent];
}

const swapTokenizer = (text) => {
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

    const txData = {
        amount,
        from,
        to
    }
    const decodedIntent = `You want to swap ${amount} ${from} for ${to}`
    return {txData, decodedIntent};
}

const sendTokenizer = (text) => { }

const mintTokenizer = (text) => { }

const tokenizer = (solution, text) => {
    const intent = intentDecoder(solution);
    if (intent === 'Swap') return swapTokenizer(text);
    if (intent === 'Send') return sendTokenizer(text);
    if (intent === 'Mint') return mintTokenizer(text);
}

export { tokenizer }