# 🎲 Decentralized Lottery on Stellar

## Project Title
**Provably Fair Decentralized Lottery with Commit-Reveal Randomness**

## Project Description
A fully decentralized, transparent, and provably fair lottery system built on the Stellar blockchain using Soroban smart contracts. This platform eliminates centralized lottery operators by leveraging blockchain technology, cryptographic commit-reveal schemes, and automatic prize distribution to ensure complete transparency, fairness, and verifiability.

**Key Differentiators:**
- 🔐 **Commit-Reveal Randomness**: Participants contribute to randomness generation, preventing manipulation
- 💰 **Automatic Payouts**: Winners receive prizes automatically upon finalization
- 🎫 **Flexible Ticket Rules**: Configurable single or multiple tickets per address
- ✅ **Externally Verifiable**: Anyone can verify winner selection using documented algorithms
- 📊 **100% On-Chain**: All data stored on Stellar blockchain - no external databases

---

## ✅ Implementation Status

### **Fully Implemented Features**

#### 1. **Core Smart Contract** ✅
- ✅ **Admin Management**: One-time initialization with admin and token addresses
- ✅ **Round Creation**: Configurable ticket price, duration, and multiple-ticket policy
- ✅ **Ticket Purchase**: Token-based payments with commit hash submission
- ✅ **Seed Reveal**: Cryptographic verification of revealed seeds
- ✅ **Winner Selection**: Deterministic, verifiable winner selection
- ✅ **Automatic Payout**: Prize pool transferred atomically to winner
- ✅ **Round Queries**: Public view function for all round details

#### 2. **Commit-Reveal Randomness System** ✅
- ✅ **Commit Phase**: Participants submit `SHA256(seed || address || round_id)` when buying tickets
- ✅ **Reveal Phase**: 24-hour window after round ends for participants to reveal seeds
- ✅ **Seed Verification**: Contract validates revealed seeds match commit hashes
- ✅ **Iterative Combination**: `combined_hash = SHA256(SHA256(...SHA256(h || seed1) || seed2) ...)`
- ✅ **Blockchain Entropy**: Adds ledger sequence to final hash for unpredictability
- ✅ **Missing Reveal Handling**: Lottery proceeds even if some participants don't reveal
- ✅ **External Verification**: Complete algorithm documented in VERIFICATION.md

#### 3. **Payment & Prize Distribution** ✅
- ✅ **Token Integration**: Uses Soroban token interface for payments
- ✅ **Payment Validation**: Exact amount matching required
- ✅ **Atomic Transfers**: Reverts entire transaction on transfer failure
- ✅ **Prize Accumulation**: Automatic prize pool tracking
- ✅ **Winner Payout**: Automatic transfer before state update (prevents reentrancy)
- ✅ **Transfer Logging**: All transfers logged for audit trail

#### 4. **Multiple Tickets Configuration** ✅
- ✅ **Per-Round Setting**: `allow_multiple` parameter in `create_round()`
- ✅ **Single Ticket Mode**: One ticket per address (fair lottery)
- ✅ **Multiple Ticket Mode**: Unlimited tickets per address (weighted lottery)
- ✅ **Efficient Checking**: O(1) duplicate detection using `ParticipantMap`
- ✅ **Storage Optimization**: Duplicate map only used when `allow_multiple = false`

#### 5. **Testing & CI/CD** ✅
- ✅ **18 Unit Tests**: 100% pass rate covering all scenarios
- ✅ **Test Categories**: Init, round creation, ticket purchase, commit-reveal, finalization, multiple tickets, full lifecycle
- ✅ **Token Mocking**: All token transfers properly mocked and verified
- ✅ **Edge Cases**: Missing reveals, wrong amounts, timing restrictions, unauthorized access
- ✅ **CI Pipeline**: GitHub Actions workflow with 6 jobs (test, build, lint, coverage, security, summary)
- ✅ **Automated Builds**: WASM artifact generation on every push

#### 6. **Data & Storage** ✅
- ✅ **100% On-Chain**: All data stored in Soroban instance storage
- ✅ **No External DB**: Fully decentralized with no off-chain dependencies
- ✅ **Immutable Records**: Commits, reveals, and winners permanently on-chain
- ✅ **Extended TTL**: 10,000 block TTL for long-term data persistence
- ✅ **Public Auditability**: Anyone can query contract storage

### **Deployment Status**

#### ✅ **Testnet Deployment** - COMPLETED
- ✅ **Contract Deployed**: `CCPLB77GYAU53P3NZJW7WUMFOJ2IV3O7NZUC7Q7RQPD4CRHWB5XEN2MM`
- ✅ **Network**: Stellar Testnet
- ✅ **Initialized**: Admin and token configured
- ✅ **Status**: Operational and ready for testing
- 📊 **Explorer**: [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCPLB77GYAU53P3NZJW7WUMFOJ2IV3O7NZUC7Q7RQPD4CRHWB5XEN2MM)

#### ⚠️ **Mainnet Deployment** - PENDING
- ⚠️ Requires security audit
- ⚠️ Requires production token selection
- ⚠️ Requires economic analysis
- ⚠️ Requires legal compliance review

### **What's Next**

#### 1. **Front-End Development** (In Progress)
- ⚠️ React-based web application
- ⚠️ Freighter wallet integration
- ⚠️ Round status dashboard
- ⚠️ Ticket purchase flow with commit hash generation
- ⚠️ Seed reveal interface
- ⚠️ Winner announcement display

#### 2. **Production Readiness**
- ⚠️ Professional security audit
- ⚠️ User acceptance testing
- ⚠️ Performance optimization
- ⚠️ Mainnet deployment

---

## 📊 Feature Implementation Matrix

| Feature | Status | Details |
|---------|--------|----------|
| **Core Contract** | ✅ Complete | 6 public functions, full CRUD operations |
| **Commit-Reveal** | ✅ Complete | SHA256-based, 24h reveal window |
| **Auto Payouts** | ✅ Complete | Atomic transfers, revert on failure |
| **Multiple Tickets** | ✅ Complete | Configurable per round |
| **Token Payments** | ✅ Complete | Soroban token interface |
| **Testing** | ✅ Complete | 18/18 tests passing |
| **CI/CD** | ✅ Complete | GitHub Actions, 6-job pipeline |
| **Documentation** | ✅ Complete | 8 comprehensive guides |
| **Testnet Deploy** | ✅ Complete | Live on Stellar Testnet |
| **Front-End** | ⚠️ In Progress | React app under development |
| **Mainnet Deploy** | ⚠️ Pending | Awaiting audit |

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

## 📋 Smart Contract API

### **Function Overview**

| Function | Access | Phase | Description |
|----------|--------|-------|-------------|
| `init_admin` | Admin | Setup | One-time initialization |
| `create_round` | Admin | Setup | Create new lottery round |
| `buy_ticket` | Public | Commit | Purchase ticket with commit hash |
| `reveal_seed` | Public | Reveal | Reveal committed seed |
| `finalize_round` | Admin | Finalize | Select winner & distribute prize |
| `view_round` | Public | Any | Query round information |

---

### **1. init_admin** (One-Time Setup)
```rust
pub fn init_admin(env: Env, admin: Address, token: Address)
```

**Purpose**: Initialize contract with admin and payment token

**Parameters**:
- `admin`: Address with administrative privileges
- `token`: Soroban token contract address for payments

**Requirements**:
- Can only be called once
- Admin must sign transaction

**Effects**:
- Stores admin address
- Stores token address
- Extends storage TTL to 100,000 blocks

---

### **2. create_round** (Admin Only)
```rust
pub fn create_round(
    env: Env,
    ticket_price: i128,
    duration_hours: u64,
    allow_multiple: bool
) -> u64
```

**Purpose**: Create new lottery round

**Parameters**:
- `ticket_price`: Cost per ticket in token units (e.g., 1000000 = 1 token with 6 decimals)
- `duration_hours`: Round duration before ticket sales close
- `allow_multiple`: 
  - `false` = One ticket per address (fair mode)
  - `true` = Multiple tickets allowed (weighted mode)

**Returns**: Round ID (sequential, starts at 1)

**Requirements**:
- Admin authorization required
- No other active round exists

**Effects**:
- Creates new `LotteryRound` with:
  - `end_time` = current_time + duration_hours
  - `reveal_deadline` = end_time + 24 hours
  - `is_active` = true
  - `finalized` = false
- Sets as active round
- Increments round counter

---

### **3. buy_ticket** (Public - Commit Phase)
```rust
pub fn buy_ticket(
    env: Env,
    round_id: u64,
    participant: Address,
    amount: i128,
    commit_hash: BytesN<32>
)
```

**Purpose**: Purchase lottery ticket with commit hash

**Parameters**:
- `round_id`: Target lottery round
- `participant`: Buyer's address
- `amount`: Payment amount (must equal ticket_price)
- `commit_hash`: `SHA256(seed || participant_address || round_id)`

**Commit Hash Generation**:
```javascript
// JavaScript example
const seed = crypto.getRandomValues(new Uint8Array(32));
const hashInput = concat(seed, addressBytes, roundIdBytes);
const commitHash = SHA256(hashInput);
// IMPORTANT: Store seed securely for reveal phase!
```

**Requirements**:
- Participant authorization required
- Round must be active
- Current time < end_time
- Amount must equal ticket_price exactly
- If `allow_multiple = false`, participant cannot have existing ticket

**Effects**:
- Transfers tokens from participant to contract
- Increments participants_count
- Adds amount to total_pool
- Stores participant address
- Stores commit hash
- Updates round data

---

### **4. reveal_seed** (Public - Reveal Phase)
```rust
pub fn reveal_seed(
    env: Env,
    round_id: u64,
    participant: Address,
    seed: Bytes
)
```

**Purpose**: Reveal seed to prove commit hash

**Parameters**:
- `round_id`: Lottery round
- `participant`: Revealer's address
- `seed`: Original random seed used in commit hash

**Requirements**:
- Participant authorization required
- Round must exist
- Current time >= end_time (round ended)
- Current time < reveal_deadline (within 24h window)
- Participant must have committed (bought ticket)
- `SHA256(seed || participant || round_id)` must match stored commit

**Effects**:
- Stores revealed seed
- Extends storage TTL

**Note**: Missing reveals don't prevent finalization

---

### **5. finalize_round** (Admin Only - Finalization)
```rust
pub fn finalize_round(env: Env, round_id: u64) -> Address
```

**Purpose**: Select winner and distribute prize

**Algorithm**:
1. Combine revealed seeds: `h = SHA256(h || seed)` for each reveal
2. Add blockchain entropy: `final = SHA256(combined || ledger_sequence)`
3. Select winner: `index = (first_8_bytes(final) % participants) + 1`
4. Transfer prize pool to winner
5. Mark round finalized

**Requirements**:
- Admin authorization required
- Round must be active
- Round not already finalized
- At least one participant
- Current time >= reveal_deadline

**Returns**: Winner's address

**Effects**:
- Transfers total_pool to winner (atomic)
- Sets is_active = false
- Sets finalized = true
- Records winner address
- Clears active round
- Logs winner selection

**Security**: Transfer happens BEFORE state update (prevents reentrancy)

---

### **6. view_round** (Public - Read-Only)
```rust
pub fn view_round(env: Env, round_id: u64) -> LotteryRound
```

**Purpose**: Query round information

**Parameters**:
- `round_id`: Round to query

**Returns**: `LotteryRound` struct:
```rust
pub struct LotteryRound {
    pub round_id: u64,
    pub ticket_price: i128,
    pub total_pool: i128,
    pub participants_count: u64,
    pub is_active: bool,
    pub winner: Option<Address>,
    pub end_time: u64,
    pub reveal_deadline: u64,
    pub finalized: bool,
    pub allow_multiple: bool,
}
```

**Note**: Returns default (zero) values if round doesn't exist

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

## 📚 Documentation

### **Essential Guides**
1. **README.md** (This file) - Complete project overview
2. **VERIFICATION.md** - External verification guide with Python script
3. **DEPLOYMENT_GUIDE.md** - Testnet/mainnet deployment instructions
4. **QUICK_START.md** - Quick reference for common operations

### **Technical Details**
5. **COMMIT_REVEAL_IMPLEMENTATION.md** - Deep dive into randomness system
6. **MULTIPLE_TICKETS_AND_CI_SUMMARY.md** - Multiple tickets & CI/CD details
7. **IMPLEMENTATION_COMPLETE.md** - Complete feature list and statistics
8. **TESTING_CHECKLIST.md** - Testing procedures and checklist

### **Status Reports**
9. **TESTNET_DEPLOYMENT_STATUS.md** - Testnet deployment details

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

| Metric | Value |
|--------|-------|
| **Contract Version** | 3.0.0 |
| **WASM Hash** | `7b3c5243fd20476fedcf94074292c41c7607346c611176534abbe71cabe14056` |
| **Contract Size** | ~50KB (optimized) |
| **Exported Functions** | 6 (init_admin, create_round, buy_ticket, reveal_seed, finalize_round, view_round) |
| **Test Coverage** | 18/18 passing (100%) |
| **Test Execution Time** | 0.30 seconds |
| **Storage Type** | On-chain (Soroban instance storage) |
| **TTL** | 10,000 blocks (extended) |
| **External Dependencies** | None (fully decentralized) |
| **SDK Version** | Soroban SDK 23.0.2 |
| **Rust Edition** | 2021 |

---

## 🌐 Deployed Contracts

### **Stellar Testnet** ✅
- **Contract ID**: `CCPLB77GYAU53P3NZJW7WUMFOJ2IV3O7NZUC7Q7RQPD4CRHWB5XEN2MM`
- **Network**: Stellar Testnet
- **Status**: ✅ Operational
- **Explorer**: [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCPLB77GYAU53P3NZJW7WUMFOJ2IV3O7NZUC7Q7RQPD4CRHWB5XEN2MM)

![Testnet Contract](image.png)

### **Stellar Mainnet** ⚠️
- **Status**: Not deployed (awaiting security audit)

---

## 🔄 Lottery Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: SETUP (Admin)                                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Deploy contract                                          │
│ 2. init_admin(admin, token)                                 │
│ 3. create_round(price, duration, allow_multiple)            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: COMMIT (Participants - Duration Hours)             │
├─────────────────────────────────────────────────────────────┤
│ 1. Generate random seed                                     │
│ 2. Compute commit_hash = SHA256(seed || address || round)   │
│ 3. buy_ticket(round, address, amount, commit_hash)          │
│ 4. Store seed securely for reveal phase                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: REVEAL (Participants - 24 Hour Window)             │
├─────────────────────────────────────────────────────────────┤
│ 1. Wait for round to end (end_time reached)                 │
│ 2. reveal_seed(round, address, seed)                        │
│ 3. Contract verifies seed matches commit                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: FINALIZE (Admin - After Reveal Deadline)           │
├─────────────────────────────────────────────────────────────┤
│ 1. Wait for reveal_deadline to pass                         │
│ 2. finalize_round(round)                                    │
│ 3. Contract combines revealed seeds                         │
│ 4. Adds blockchain entropy (ledger sequence)                │
│ 5. Selects winner deterministically                         │
│ 6. Transfers prize pool to winner automatically             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Important Notes

### **For Developers**
1. **Commit Hash**: Front-end must generate `SHA256(seed || address || round_id)` and store seed
2. **Reveal Window**: 24 hours after round ends - participants must reveal within this time
3. **Missing Reveals**: Don't prevent finalization - lottery proceeds with available reveals
4. **Token Decimals**: Account for token decimals when setting ticket_price (e.g., 1000000 = 1 token with 6 decimals)

### **For Users**
1. **Seed Storage**: Keep your seed safe! You need it to reveal after the round ends
2. **Reveal Requirement**: You must reveal your seed to be eligible for winning
3. **Timing**: Buy tickets before `end_time`, reveal between `end_time` and `reveal_deadline`
4. **Fairness**: Winner selection is deterministic and verifiable - see VERIFICATION.md

### **Security Considerations**
1. **Audits**: Professional security audit recommended before mainnet deployment
2. **Testing**: All features tested on testnet before mainnet use
3. **Verification**: Anyone can verify winner selection using documented algorithms
4. **Transparency**: All data is on-chain and publicly auditable

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass (`cargo test`)
5. Submit a pull request

---

## 📄 License

This project is open source. See LICENSE file for details.

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/Praanshuu/Decentralized-Lottery/issues)
- **Documentation**: See documentation files listed above
- **Verification**: See VERIFICATION.md for external verification guide

---

**Built with ❤️ on Stellar Blockchain**

*Where transparency meets fairness, and every draw is provably random*

---

**Last Updated**: November 2, 2025  
**Version**: 3.0.0  
**Status**: ✅ Smart Contract Complete | ⚠️ Front-End In Progress | ✅ Testnet Deployed
