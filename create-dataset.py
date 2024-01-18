import pandas as pd
import random
from itertools import permutations

# Function to generate swap expressions
def generate_swap_expression(token1, token2):
    expressions = [
        f"I want to swap {token1} with {token2}.",
        f"Can I exchange {token2} for {token1}?",
        f"Swap {token1} and give me {token2}.",
        f"Exchange {token2} with {token1}, please.",
        f"I need to trade {token1} for {token2}.",
        f"Is it possible to swap {token2} with {token1}?",
        f"Give me {token2} in exchange for {token1}.",
        f"I would like to exchange {token1} with {token2}.",
        f"I want to swap my {token1} with the best possible amount of {token2}.",
        f"Let's trade {token2} for {token1}.",
        f"I'm looking to swap {token1} and {token2}.",
        f"Swap {token1} for {token2} at the best rate.",
    ]
    return random.choice(expressions)

# Function to generate send expressions
def generate_send_expression(sender_token, recipient_address, amount):
    expressions = [
        f"I want to send {amount} {sender_token} to {recipient_address}.",
        f"Can I transfer {amount} {sender_token} to {recipient_address}?",
        f"Send {amount} {sender_token} from my wallet to {recipient_address}.",
        f"I need to dispatch {amount} {sender_token} to {recipient_address}.",
        f"Is it possible to send {amount} {sender_token} to {recipient_address}?",
        f"Transfer {amount} {sender_token} to {recipient_address}.",
        f"I'm planning to send {amount} {sender_token} to {recipient_address}.",
        f"Let's initiate a transaction: {amount} {sender_token} to {recipient_address}.",
    ]
    return random.choice(expressions)

# Function to generate a synthetic dataset
def generate_transaction_dataset(num_samples, tokens):
    data = {
        'UserExpression': [],
        'Intent': [],
        'TokenOrder': []
    }

    token_pairs = list(permutations(tokens, 2))  # Generate all possible token pairs

    for _ in range(num_samples):
        # Randomly choose between swap and send intent
        intent = random.choice(['Swap', 'Send'])
        
        if intent == 'Swap':
            token1, token2 = random.choice(token_pairs)
            expression = generate_swap_expression(token1, token2)
        else:
            sender_token, recipient_address, amount = random.sample(tokens, 1)[0], 'RecipientAddress', 'Amount'
            expression = generate_send_expression(sender_token, recipient_address, amount)

        data['UserExpression'].append(expression)
        data['Intent'].append(intent)
        data['TokenOrder'].append((token1, token2) if intent == 'Swap' else (sender_token, recipient_address))

    return pd.DataFrame(data)

# Specify at least 5 different tokens
tokens = ['BTC', 'ETH', 'USDC', 'USDT', 'MATIC']

# Generate a large synthetic dataset for transactions
num_samples = 1000  # Adjust as needed
transaction_dataset = generate_transaction_dataset(num_samples, tokens)

# Save the dataset to a CSV file
transaction_dataset.to_csv('dataset.csv', index=False)

# Display the first few rows of the dataset
print(transaction_dataset.head())