# Frontend Quick Start Guide

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at: `http://localhost:5173`

### 3. Connect Freighter Wallet

1. Install [Freighter](https://freighter.app) browser extension
2. Create or import a wallet
3. Switch to **Testnet** network in Freighter
4. Click "Connect Freighter Wallet" in the app

### 4. Get Test Tokens

You need TEST tokens to buy lottery tickets:

```bash
# Mint test tokens using Stellar CLI
stellar contract invoke \
  --id CBL6QNUKJAQVYJRL2M2SVHND2F7XAFBDSE77P7TLX5JXBYA7WSS7Y3CI \
  --source YOUR_KEY \
  --network testnet \
  -- transfer \
  --from YOUR_ADDRESS \
  --to YOUR_ADDRESS \
  --amount 10000000000
```

## 📋 Using the App

### Buying a Ticket

1. **Connect Wallet** - Click "Connect Freighter Wallet"
2. **Check Balance** - Token balance is shown automatically
3. **Buy Ticket** - Click "Buy Ticket" button
4. **Approve Tokens** - Approve in Freighter (first time only)
5. **Confirm Purchase** - Sign the transaction in Freighter
6. **Done!** - Your seed is automatically stored

### Revealing Seed

1. **Wait for Round to End** - Button appears automatically
2. **Click "Reveal Seed"** - During reveal phase
3. **Confirm Transaction** - Sign in Freighter
4. **Done!** - Seed is automatically removed

## 🔧 Configuration

### Contract Addresses

Already configured in `src/config.ts`:

- **Lottery Contract**: `CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV`
- **Token Contract**: `CBL6QNUKJAQVYJRL2M2SVHND2F7XAFBDSE77P7TLX5JXBYA7WSS7Y3CI`
- **Network**: `testnet`

To change, create `.env` file:

```env
VITE_LOTTERY_CONTRACT_ID=YOUR_CONTRACT_ID
VITE_TOKEN_CONTRACT_ID=YOUR_TOKEN_ID
VITE_NETWORK=testnet
```

## ⚠️ Important Notes

### Seed Storage

- Seeds are stored in **browser localStorage**
- **DO NOT clear browser data** before revealing
- Seeds are per-round (key: `lottery_seed_<round_id>`)
- Seeds are automatically removed after successful reveal

### Token Requirements

- You need **TEST tokens** (not XLM) for tickets
- XLM is still needed for transaction fees
- Balance is checked automatically before purchase

### Network

- Ensure Freighter is on **Testnet** network
- App is configured for testnet by default
- Change in `src/config.ts` for mainnet

## 🐛 Troubleshooting

### Wallet Won't Connect

- Ensure Freighter is installed and unlocked
- Check network matches (testnet)
- Refresh the page and try again

### Transaction Fails

- Check token balance
- Ensure token approval succeeded
- Check you have XLM for fees
- Verify network connection

### Seed Not Found

- Make sure you purchased a ticket
- Check localStorage wasn't cleared
- Verify correct round ID

### Balance Not Loading

- Check network connection
- Verify token contract address
- Try refreshing manually (🔄 button)

## 📱 Features

✅ **Auto-detect Active Round** - Finds active rounds automatically  
✅ **Balance Check** - Shows your token balance  
✅ **Seed Management** - Automatically stores/removes seeds  
✅ **Transaction Status** - Shows success/error messages  
✅ **Phase Detection** - Shows correct buttons for each phase  

## 🔗 Useful Links

- [Freighter Wallet](https://freighter.app)
- [Stellar Testnet Explorer](https://stellar.expert/explorer/testnet)
- [Soroban Documentation](https://soroban.stellar.org/docs)

## 📞 Support

For issues, check:
1. Browser console for errors
2. Freighter transaction history
3. Network connection
4. Contract status on explorer
