# Deployment Guide - Stellar Testnet

## Prerequisites

1. **Stellar Account** with testnet XLM for fees
   - If you don't have one: https://www.stellar.org/laboratory/#account-creator?network=test
   - Or use: `stellar keys generate` and fund via friendbot

2. **Token Contract** (for payments)
   - You can use a testnet token contract or deploy your own

## Deployment Steps

### Step 1: Generate/Fund Testnet Account

```bash
# Generate a new account (if you don't have one)
stellar keys generate --global-key

# Fund via friendbot (testnet only)
curl "https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY"
```

### Step 2: Deploy Contract

```bash
# Navigate to contract directory
cd contracts/hello-world

# Build contract (already done)
stellar contract build

# Deploy to testnet
stellar contract deploy \
  --wasm target/../wasm32v1-none/release/hello_world.wasm \
  --source YOUR_SECRET_KEY \
  --network testnet
```

### Step 3: Initialize Contract

```bash
# Initialize with admin and token
stellar contract invoke \
  --id CONTRACT_ID \
  --source ADMIN_SECRET_KEY \
  --network testnet \
  -- init_admin \
  --admin ADMIN_ADDRESS \
  --token TOKEN_CONTRACT_ADDRESS
```

### Step 4: Create First Round

```bash
# Create a test round
stellar contract invoke \
  --id CONTRACT_ID \
  --source ADMIN_SECRET_KEY \
  --network testnet \
  -- create_round \
  --ticket_price 1000000 \
  --duration_hours 24 \
  --allow_multiple false
```

### Step 5: Test Ticket Purchase

```bash
# Buy a ticket (requires commit hash)
# Front-end needs to generate seed and compute commit_hash
# For CLI testing, you can use a simple seed

# Note: This requires implementing commit hash generation
# Commit = SHA256(seed || participant_address || round_id)
```

## Quick Test Script

See `test_deployment.sh` for automated testing.

