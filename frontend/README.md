# Decentralized Lottery Frontend

## Overview

This is the frontend application for the Decentralized Lottery smart contract on Stellar. It provides a user-friendly interface for interacting with the lottery system.

## Features

✅ **Wallet Integration** - Connect with Freighter wallet  
✅ **View Lottery Rounds** - See active rounds and their details  
✅ **Buy Tickets** - Purchase lottery tickets with commit-reveal scheme  
✅ **Reveal Seeds** - Reveal your seed after round ends  
✅ **Token Balance** - Check your token balance  
✅ **Auto-detect Active Round** - Automatically finds active rounds  

## Prerequisites

- Node.js 18+ and npm/yarn
- Freighter wallet extension installed
- Testnet XLM and tokens for testing

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

The contract addresses are already configured in `src/config.ts`. If you need to change them, create a `.env` file:

```env
VITE_LOTTERY_CONTRACT_ID=CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV
VITE_TOKEN_CONTRACT_ID=CBL6QNUKJAQVYJRL2M2SVHND2F7XAFBDSE77P7TLX5JXBYA7WSS7Y3CI
VITE_NETWORK=testnet
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Connecting Wallet

1. Install [Freighter](https://freighter.app) browser extension
2. Click "Connect Freighter Wallet" in the app
3. Approve the connection in Freighter

### Buying a Ticket

1. Ensure your wallet is connected
2. Make sure you have enough tokens (check balance shown)
3. Click "Buy Ticket"
4. Approve token spending (first time only)
5. Confirm the ticket purchase transaction
6. Your seed is automatically stored in browser localStorage

### Revealing Seed

1. Wait for the round to end
2. During the reveal phase (24 hours after round ends)
3. Click "Reveal Seed" button
4. Confirm the reveal transaction
5. The seed is automatically removed after successful reveal

## Important Notes

### Seed Storage

- Your seed is stored in browser localStorage
- **DO NOT clear browser data** before revealing, or you'll lose your seed
- Seeds are stored with key: `lottery_seed_<round_id>`
- Seeds are automatically removed after successful reveal

### Token Requirements

- You need TEST tokens for testnet
- Token balance is automatically checked before purchase
- If balance is insufficient, the buy button will be disabled

## Troubleshooting

### Wallet Connection Issues

- Ensure Freighter is installed and unlocked
- Check that you're on the correct network (testnet/mainnet)
- Try refreshing the page

### Transaction Failures

- Check your token balance
- Ensure you've approved token spending
- Check network connection
- Verify you have XLM for transaction fees

### Seed Not Found

- Make sure you purchased a ticket for this round
- Check that localStorage wasn't cleared
- Seeds are stored per round ID

## Development

### Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── utils/          # Utilities (contract, wallet, commit-reveal)
│   ├── providers/      # React providers
│   ├── config.ts       # Configuration
│   └── App.tsx         # Main app component
├── package.json
└── vite.config.ts
```

### Key Files

- `src/config.ts` - Contract addresses and network config
- `src/utils/contract.ts` - Contract interaction functions
- `src/utils/commitReveal.ts` - Commit-reveal scheme utilities
- `src/components/RoundDisplay.tsx` - Main lottery UI
- `src/components/WalletConnect.tsx` - Wallet connection UI

## Contract Integration

The frontend uses:
- **Soroban Client** - For contract calls
- **Stellar SDK** - For transaction building
- **Freighter API** - For wallet integration

All contract functions are wrapped in `src/utils/contract.ts` for easy use.

## Security

- Seeds are stored locally (never sent to server)
- All transactions are signed by user's wallet
- Commit-reveal scheme prevents manipulation
- Transactions are executed on Stellar blockchain

## Support

For issues or questions, refer to the main project README or contact the development team.
