# Lottery Contract Quick Start Guide

## 🚀 Quick Reference

### Contract Functions

```rust
// 1. Initialize (Admin, one-time)
init_admin(admin: Address, token: Address)

// 2. Create Round (Admin only)
create_round(ticket_price: i128, duration_hours: u64) -> u64

// 3. Buy Ticket (Anyone)
buy_ticket(round_id: u64, participant: Address, amount: i128)

// 4. Draw Winner (Admin only)
draw_winner(round_id: u64) -> Address

// 5. View Round (Anyone)
view_round(round_id: u64) -> LotteryRound
```

## 📋 Step-by-Step Usage

### Admin Workflow

#### 1️⃣ Deploy and Initialize
```bash
# Build
stellar contract build

# Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello_world.wasm \
  --source YOUR_SECRET_KEY \
  --network testnet

# Initialize
stellar contract invoke \
  --id CONTRACT_ID \
  --source ADMIN_SECRET_KEY \
  --network testnet \
  -- init_admin \
  --admin ADMIN_ADDRESS \
  --token TOKEN_ADDRESS
```

#### 2️⃣ Create Lottery Round
```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source ADMIN_SECRET_KEY \
  --network testnet \
  -- create_round \
  --ticket_price 1000000 \
  --duration_hours 24
```

#### 3️⃣ Draw Winner (After Round Ends)
```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source ADMIN_SECRET_KEY \
  --network testnet \
  -- draw_winner \
  --round_id 1
```

### User Workflow

#### 1️⃣ Check Active Round
```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --network testnet \
  -- view_round \
  --round_id 1
```

#### 2️⃣ Buy Ticket
```javascript
// Front-end example
const token = new token.Client(tokenAddress);
const lottery = new Contract(lotteryAddress);

// Step 1: Approve tokens
await token.approve({
  from: userAddress,
  spender: lotteryAddress,
  amount: ticketPrice,
  expiration_ledger: currentLedger + 100000
});

// Step 2: Buy ticket
await lottery.buy_ticket({
  round_id: 1,
  participant: userAddress,
  amount: ticketPrice
});
```

## 🧪 Test Locally

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_buy_ticket

# Build optimized WASM
stellar contract build
```

## 📊 Contract State

### Storage Structure
```
ADMIN → Address (who can manage rounds)
TOKEN → Address (payment token contract)
ROUND_COUNT → u64 (total rounds created)
ACTIVE_ROUND → u64 (current active round ID)
RoundBook::Round(id) → LotteryRound
ParticipantBook::Participant(round_id, index) → Address
```

### LotteryRound Structure
```rust
{
  round_id: u64,
  ticket_price: i128,
  total_pool: i128,
  participants_count: u64,
  is_active: bool,
  winner: Option<Address>,
  end_time: u64
}
```

## ⚠️ Important Notes

### Payment Requirements
- ✅ User must approve token allowance BEFORE buying ticket
- ✅ Payment amount must EXACTLY match ticket_price
- ✅ Contract will transfer tokens automatically
- ✅ Tokens go to contract, not admin

### Time Restrictions
- ✅ Cannot buy ticket after end_time
- ✅ Cannot draw winner before end_time
- ✅ Cannot create new round if one is active

### Admin Restrictions
- ✅ Only admin can create rounds
- ✅ Only admin can draw winners
- ✅ Anyone can buy tickets
- ✅ Anyone can view round info

## 🔒 Security Checks

The contract validates:
- ✅ Admin authorization (create_round, draw_winner)
- ✅ Participant authorization (buy_ticket)
- ✅ Payment amount correctness
- ✅ Round active status
- ✅ Time boundaries
- ✅ Participant count > 0 for drawing

## 🐛 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Contract not initialized" | Admin not set | Call init_admin first |
| "Contract already initialized" | Trying to init twice | Already initialized |
| "Incorrect payment amount" | Wrong amount sent | Send exact ticket_price |
| "Lottery round is not active" | Round ended/closed | Check active rounds |
| "Lottery round has ended" | Past end_time | Wait for new round |
| "Cannot create new round" | Active round exists | Wait for current to end |

## 📱 Front-End Integration

### Minimal UI Requirements
1. **Display active round info** (ticket_price, end_time, pool)
2. **Token approval button** (one-time setup)
3. **Buy ticket button** (with payment)
4. **Show user's participation status**
5. **Display winner when drawn**

### Recommended Features
- Countdown timer to end_time
- Prize pool display with live updates
- Participant count
- Transaction history
- Winner announcements
- Automatic round refresh

## 🎯 Testing Checklist

Before deploying:
- [ ] All 10 tests pass
- [ ] Contract builds successfully
- [ ] Admin functions restricted properly
- [ ] Payment flow works correctly
- [ ] Winner selection is random
- [ ] Time validations work
- [ ] Storage keys unique and correct

## 📚 Resources

- [Soroban Documentation](https://soroban.stellar.org/)
- [Token Interface](https://developers.stellar.org/docs/tokens/token-interface)
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli)
- [Example Contracts](https://github.com/stellar/soroban-examples)

---

**Ready to deploy!** 🚀
