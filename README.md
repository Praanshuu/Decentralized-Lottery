# Decentralized Lottery

## Project Title
**Provably Fair Decentralized Lottery on Stellar Blockchain**

## Project Description
The Decentralized Lottery is a transparent and fair lottery system built on the Stellar blockchain using Soroban smart contracts. This platform eliminates the need for trust in centralized lottery operators by leveraging blockchain technology to ensure complete transparency, fairness, and verifiability of every draw.

Participants can purchase lottery tickets with cryptocurrency, and winners are selected using a commit-reveal randomness scheme combined with blockchain entropy. All transactions, participants, and results are permanently stored on the blockchain, making the lottery provably fair and auditable by anyone.

---

## ✅ Implementation Status

### **Fully Implemented Features**

#### 1. **Core Smart Contract** ✅
- ✅ Admin initialization and management
- ✅ Lottery round creation with configurable settings
- ✅ Ticket purchase with token payments
- ✅ Provably fair winner selection using commit-reveal scheme
- ✅ Automatic prize pool distribution to winners
- ✅ Round viewing and information querying
- ✅ Storage TTL management for long-term data preservation

#### 2. **Advanced Randomness System** ✅
- ✅ Commit-reveal scheme (preventing manipulation)
- ✅ Blockchain entropy injection (ledger sequence)
- ✅ Iterative seed combination algorithm
- ✅ External verification support
- ✅ Missing reveal handling (robust against non-participation)

#### 3. **Payment & Prize Distribution** ✅
- ✅ Token-based payment integration
- ✅ Atomic token transfers (revert on failure)
- ✅ Automatic prize pool accumulation
- ✅ Automatic winner payout upon finalization

#### 4. **Multiple Tickets Support** ✅
- ✅ Configurable multiple tickets per address (per round)
- ✅ Efficient duplicate checking (O(1) lookup)
- ✅ Support for both fair and weighted lottery modes

#### 5. **Testing & Quality Assurance** ✅
- ✅ 18 comprehensive unit tests (100% pass rate)
- ✅ Token transfer mocking
- ✅ Edge case coverage
- ✅ Error condition validation
- ✅ Full lifecycle testing

#### 6. **On-Chain Storage** ✅
- ✅ Complete data storage on Stellar blockchain
- ✅ No external database required
- ✅ Immutable transaction history
- ✅ Extended TTL (10000 blocks) for data persistence
- ✅ All data publicly auditable

### **What's Remaining**

#### 1. **Front-End Application** ❌
- ❌ Web application/UI for user interaction
- ❌ Wallet integration (Freighter, etc.)
- ❌ Real-time round status display
- ❌ Ticket purchase interface
- ❌ Winner announcement interface
- ❌ Transaction history viewer

#### 2. **Real Network Deployment** ⚠️
- ⚠️ Deployment to Stellar testnet (for testing)
- ⚠️ Deployment to Stellar mainnet (for production)
- ⚠️ Integration with real Stellar tokens
- ⚠️ Real-time blockchain data usage

#### 3. **Future Enhancements** (See Future Scope section below)

---

## 📊 Current State vs Original Plan

| Feature | Original Plan | Current Status |
|---------|--------------|----------------|
| Basic lottery contract | Planned | ✅ **Implemented** |
| Token payments | Planned | ✅ **Implemented** |
| Winner selection | Planned | ✅ **Implemented** (Enhanced with commit-reveal) |
| Automatic payouts | Future Scope | ✅ **Implemented** |
| Multiple tickets | Future Scope | ✅ **Implemented** |
| Front-end UI | Not specified | ❌ **Not started** |
| Testnet deployment | Planned | ⚠️ **Ready but not deployed** |
| Mainnet deployment | Planned | ⚠️ **Not done** |

---

## 🗄️ Storage & Data

### **Storage System**
- ✅ **On-Chain Storage**: All data is stored on the Stellar blockchain using Soroban's instance storage
- ✅ **No External Database**: This is a fully decentralized application with no external storage dependencies
- ✅ **Immutable Records**: All lottery rounds, participants, commits, reveals, and winners are permanently recorded on-chain
- ✅ **Public Access**: Anyone can query contract storage to verify lottery results

### **Data Type**
- ⚠️ **Tests Use Mock Data**: The 18 unit tests use mocked blockchain environments (`env.mock_all_auths()`, simulated ledger, etc.)
- ⚠️ **Production Uses Real-Time Data**: When deployed to Stellar testnet/mainnet, the contract will use real-time blockchain data:
  - Real ledger timestamps
  - Real ledger sequence numbers
  - Real token balances
  - Real participant addresses
  - Real transaction histories

### **Storage Structure**
```rust
// Instance Storage (Persistent)
ADMIN → Address
TOKEN → Address  
ROUND_COUNT → u64
ACTIVE_ROUND → u64
RoundBook::Round(id) → LotteryRound
ParticipantBook::Participant(round_id, index) → Address
CommitBook::Commit(round_id, participant) → BytesN<32>
RevealBook::Reveal(round_id, participant) → Bytes
ParticipantMap::HasTicket(round_id, participant) → bool
```

---

## 🚀 Quick Start Guide

### **Prerequisites**
- Rust toolchain (latest stable)
- Stellar CLI installed: `cargo install --locked stellar-cli`
- Soroban SDK v23.0.2 (configured via Cargo.toml)

### **1. Build the Contract**
```bash
cd contracts/hello-world
stellar contract build
```

### **2. Run Tests** (Uses Mock Data)
```bash
# Run all tests
cargo test

# Run specific test
cargo test test_buy_ticket

# Run with output
cargo test -- --nocapture
```

### **3. Deploy to Stellar Testnet** (Uses Real-Time Data)

#### Step 1: Deploy Contract
```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello_world.wasm \
  --source <YOUR_SECRET_KEY> \
  --network testnet
```

#### Step 2: Initialize Contract
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <ADMIN_SECRET_KEY> \
  --network testnet \
  -- init_admin \
  --admin <ADMIN_ADDRESS> \
  --token <TOKEN_CONTRACT_ADDRESS>
```

#### Step 3: Create First Lottery Round
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <ADMIN_SECRET_KEY> \
  --network testnet \
  -- create_round \
  --ticket_price 1000000 \
  --duration_hours 24 \
  --allow_multiple false
```

### **4. Interact with Contract**

#### Buy Ticket (Front-end or CLI)
```bash
# Note: buy_ticket requires commit_hash parameter
# Front-end needs to:
# 1. Generate secret seed
# 2. Compute: commit_hash = SHA256(seed || address || round_id)
# 3. Store seed for later reveal
# 4. Call buy_ticket with commit_hash
```

#### Reveal Seed (After Round Ends)
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <PARTICIPANT_SECRET_KEY> \
  --network testnet \
  -- reveal_seed \
  --round_id 1 \
  --participant <PARTICIPANT_ADDRESS> \
  --seed <STORED_SEED>
```

#### Finalize Round (Admin Only)
```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <ADMIN_SECRET_KEY> \
  --network testnet \
  -- finalize_round \
  --round_id 1
```

---

## 📋 Contract API

### **1. Initialize Contract** (Admin - One-time)
```rust
init_admin(admin: Address, token: Address)
```
- Initializes the contract with admin and payment token
- Must be called once before any other operations
- Cannot be called twice

### **2. Create Lottery Round** (Admin Only)
```rust
create_round(
    ticket_price: i128,
    duration_hours: u64,
    allow_multiple: bool
) -> u64
```
- Creates a new lottery round
- Only one active round allowed at a time
- Returns unique round ID
- `allow_multiple`: `false` = one ticket per address, `true` = multiple tickets allowed

### **3. Buy Lottery Ticket** (Public)
```rust
buy_ticket(
    round_id: u64,
    participant: Address,
    amount: i128,
    commit_hash: BytesN<32>  // Commit-reveal hash
)
```
- Purchase a ticket with token payment
- Requires commit hash for commit-reveal scheme
- Validates exact payment amount
- Transfers tokens from participant to contract
- Stores commit hash for later verification

### **4. Reveal Seed** (Participants - After Round Ends)
```rust
reveal_seed(
    round_id: u64,
    participant: Address,
    seed: Bytes
)
```
- Reveals the seed used in commit hash
- Must be called between `end_time` and `reveal_deadline` (24 hours)
- Verifies seed matches stored commit hash
- Required for winner selection

### **5. Finalize Round** (Admin Only - After Reveal Deadline)
```rust
finalize_round(round_id: u64) -> Address
```
- Combines all revealed seeds
- Adds blockchain entropy (ledger sequence)
- Selects winner deterministically
- Automatically transfers prize pool to winner
- Marks round as finalized
- Returns winner address

### **6. View Round Information** (Public)
```rust
view_round(round_id: u64) -> LotteryRound
```
- Query any lottery round's details
- Returns: round_id, ticket_price, total_pool, participants_count, is_active, winner, end_time, reveal_deadline, finalized, allow_multiple

---

## 🎯 Next Steps to Run Successfully

### **Immediate Next Steps**

#### 1. **Test Locally** (Mock Data)
```bash
# Already working - verify tests pass
cd contracts/hello-world
cargo test
```
✅ **Status**: All 18 tests passing with mock data

#### 2. **Deploy to Testnet** (Real-Time Data)
```bash
# Build WASM
stellar contract build

# Deploy (requires Stellar account with XLM)
stellar contract deploy \
  --wasm target/wasm32v1-none/release/hello_world.wasm \
  --source <YOUR_SECRET_KEY> \
  --network testnet

# Initialize (requires token contract address)
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <ADMIN_SECRET_KEY> \
  --network testnet \
  -- init_admin \
  --admin <ADMIN_ADDRESS> \
  --token <TOKEN_CONTRACT_ADDRESS>
```
⚠️ **Status**: Ready to deploy, but needs:
- Stellar testnet account with XLM for fees
- Deployed token contract address
- Network connectivity

#### 3. **Build Front-End Application**
- ❌ **Status**: Not started
- **Requirements**:
  - React/Vue/Angular or similar framework
  - Stellar SDK integration
  - Wallet connector (Freighter)
  - UI for buying tickets, viewing rounds, revealing seeds
  - Transaction status monitoring

### **Recommended Development Order**
1. ✅ **Complete**: Smart contract development and testing
2. ⚠️ **Next**: Deploy to testnet and test with real transactions
3. ❌ **Then**: Build front-end application
4. ❌ **Finally**: User acceptance testing and mainnet deployment

---

## 🧪 Testing Information

### **Test Environment**
- **Data Type**: Mock/Simulated blockchain data
- **Authentication**: Mocked (`env.mock_all_auths()`)
- **Ledger**: Simulated timestamps and sequences
- **Tokens**: Mock token contracts
- **Storage**: In-memory contract storage

### **Test Coverage**
- ✅ 18/18 tests passing (100%)
- ✅ All contract functions tested
- ✅ Token transfers mocked and verified
- ✅ Edge cases covered
- ✅ Error conditions validated

### **Running Tests**
```bash
# All tests
cargo test

# Specific test
cargo test test_full_lottery_lifecycle

# With verbose output
cargo test -- --nocapture --test-threads=1
```

---

## 🔐 Security Features

- ✅ Admin-only functions with authorization checks
- ✅ Participant authentication required
- ✅ Commit-reveal prevents randomness manipulation
- ✅ Atomic token transfers (revert on failure)
- ✅ Time-based phase restrictions
- ✅ Input validation (amounts, rounds, participants)
- ✅ External verification possible

---

## 📚 Documentation Files

1. **README.md** (This file) - Project overview and status
2. **VERIFICATION.md** - External verification guide for commit-reveal scheme
3. **COMMIT_REVEAL_IMPLEMENTATION.md** - Technical details of commit-reveal system
4. **QUICK_START.md** - Quick reference guide
5. **IMPLEMENTATION_SUMMARY.md** - Original features summary
6. **FINAL_SUMMARY.md** - Commit-reveal and payout implementation
7. **MULTIPLE_TICKETS_AND_CI_SUMMARY.md** - Multiple tickets feature details
8. **IMPLEMENTATION_COMPLETE.md** - Complete feature list and statistics

---

## 🎯 Future Scope

### Short-term Enhancements
- **Prize Distribution Tiers**: Multiple prize levels (1st, 2nd, 3rd place)
- **Ticket History**: Track individual participant's purchase history
- **Enhanced Randomness**: Stellar's native randomness features when available

### Medium-term Development
- **Recurring Lotteries**: Automated daily/weekly/monthly rounds
- **Jackpot Rollovers**: Accumulate unclaimed prizes into next round
- **Charity Integration**: Option to donate percentage of prize pool
- **Referral System**: Reward participants for bringing new players
- **Statistics Dashboard**: Comprehensive analytics
- **Multi-token Support**: Accept various cryptocurrencies

### Long-term Vision
- **DAO Governance**: Community-driven management
- **NFT Tickets**: Collectible NFT tickets with unique artwork
- **Cross-chain Lottery**: Multi-blockchain participation
- **Mobile Applications**: Native iOS and Android apps
- **VRF Integration**: Verifiable Random Functions

---

## 📊 Contract Statistics

- **Contract Version**: 3.0.0 (Commit-Reveal + Auto-Payout + Multiple Tickets)
- **Test Coverage**: 18/18 passing (100%)
- **Build Status**: ✅ Success
- **WASM Size**: ~50KB (optimized)
- **Exported Functions**: 6
- **Storage Type**: On-chain (Stellar blockchain)
- **External Dependencies**: None (fully decentralized)

---

## 🌐 Contract Details

**Testnet Contract**: `CCPLB77GYAU53P3NZJW7WUMFOJ2IV3O7NZUC7Q7RQPD4CRHWB5XEN2MM`

![Contract Explorer](stellar.expert_explorer_testnet_contract_CCPLB77GYAU53P3NZJW7WUMFOJ2IV3O7NZUC7Q7RQPD4CRHWB5XEN2MM.png)

**Built with Soroban SDK v23.0.2 on Stellar Blockchain**

*Where luck meets transparency, and fairness is guaranteed by code*

---

## ⚠️ Important Notes

1. **Mock vs Real Data**: Tests use mock data. Deploy to testnet/mainnet for real blockchain data.
2. **Storage**: All data is on-chain. No external database is used or needed.
3. **Front-End**: Currently, only the smart contract exists. A front-end application needs to be built for user interaction.
4. **Deployment**: Contract is ready for deployment but requires:
   - Stellar account with XLM for fees
   - Token contract address for payments
   - Network connectivity

---

**Last Updated**: 2024  
**Implementation Status**: Smart Contract Complete ✅ | Front-End Pending ❌ | Testnet Ready ⚠️
