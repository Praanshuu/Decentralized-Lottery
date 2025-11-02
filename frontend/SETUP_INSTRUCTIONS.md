# Frontend Setup Instructions

## Important Note

The frontend UI has been created with the basic structure, but **transaction building for Soroban contracts requires additional SDK setup**. 

## Current Status

✅ **Completed:**
- React app structure
- Wallet connection UI (Freighter)
- Round viewing functionality
- Commit-reveal utilities
- UI components and styling

⚠️ **Needs Implementation:**
- Soroban transaction building (buy ticket, reveal seed, approve tokens)
- Proper SDK integration for contract interactions

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

**Note:** If you encounter package errors, you may need to install the correct Soroban SDK. Currently, the code uses a simplified fetch-based approach for viewing rounds, but transaction building requires the proper SDK.

### 2. Configure Contract Addresses

Edit `src/config.ts`:

```typescript
export const CONFIG = {
  LOTTERY_CONTRACT_ID: "YOUR_LOTTERY_CONTRACT_ID",
  TOKEN_CONTRACT_ID: "YOUR_TOKEN_CONTRACT_ID",
  NETWORK: "testnet",
  // ...
};
```

### 3. Run Development Server

```bash
npm run dev
```

## Current Functionality

The UI currently supports:

1. **Viewing Rounds** - You can view round information by entering a round ID
2. **Wallet Connection** - Connect Freighter wallet to view your address
3. **Display Round Info** - See round status, participants, prize pool, etc.

## What Needs Implementation

For full functionality (buy ticket, reveal seed), you need to:

1. **Install Soroban SDK:**
   ```bash
   npm install @soroban-react/core @soroban-react/contracts
   ```
   OR use the Stellar SDK properly for Soroban contracts

2. **Implement Transaction Building:**
   - Build proper Soroban transactions
   - Use Soroban's transaction builder
   - Handle contract invocation properly

3. **Alternative: Use CLI Wrapper**
   - Create a backend API that wraps Stellar CLI commands
   - Frontend calls backend API for transactions
   - Backend handles transaction signing and submission

## Recommended Approach

For a working implementation quickly, you could:

### Option 1: Use Backend API
Create a simple Node.js backend that:
- Wraps Stellar CLI commands
- Provides REST API endpoints
- Frontend calls these endpoints

### Option 2: Use Proper SDK
Install and configure the correct Soroban SDK packages for JavaScript/TypeScript.

### Option 3: CLI Instructions
For now, display CLI commands in the UI for users to run manually until full SDK integration is complete.

## Testing Current Features

1. Start dev server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. Connect Freighter wallet
4. Enter round ID and click "Refresh" to view round information

## Next Steps

1. Choose transaction building approach (SDK vs Backend API)
2. Implement transaction building for:
   - Approve tokens
   - Buy ticket
   - Reveal seed
3. Test with testnet contracts
4. Deploy to production
