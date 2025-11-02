# Testnet Deployment Status - Real-Time Testing

## ✅ Successfully Deployed and Configured

### Deployment Information

**Lottery Contract ID**: `CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV`
- **Explorer**: https://stellar.expert/explorer/testnet/contract/CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV
- **Wasm Hash**: `7b3c5243fd20476fedcf94074292c41c7607346c611176534abbe71cabe14056`
- **Network**: Stellar Testnet
- **Status**: ✅ Deployed and Initialized

**Token Contract ID**: `CBL6QNUKJAQVYJRL2M2SVHND2F7XAFBDSE77P7TLX5JXBYA7WSS7Y3CI`
- **Asset**: TEST (issued by `SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF`)
- **Network**: Stellar Testnet
- **Status**: ✅ Deployed

**Admin Account**: `SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF`
**Admin Key Alias**: `praanshuu`

### Current Round Status

**Round ID**: 1
```json
{
  "round_id": 1,
  "ticket_price": "1000000",
  "total_pool": "0",
  "participants_count": 0,
  "is_active": true,
  "winner": null,
  "end_time": 1761999374,
  "reveal_deadline": 1762085774,
  "finalized": false,
  "allow_multiple": false
}
```

---

## ✅ Completed Steps

1. ✅ **Contract Built** - WASM compiled successfully
2. ✅ **Contract Deployed** - Deployed to Stellar Testnet
3. ✅ **Token Contract Deployed** - TEST token deployed for payments
4. ✅ **Contract Initialized** - Admin and token configured
5. ✅ **Round Created** - First lottery round active (1 hour duration)
6. ✅ **Round Verified** - Contract functions responding correctly

---

## 🧪 Next Steps for Full Testing

### Step 1: Mint Tokens to Test Account
```bash
# Mint tokens to your account for testing
stellar contract invoke \
  --id CBL6QNUKJAQVYJRL2M2SVHND2F7XAFBDSE77P7TLX5JXBYA7WSS7Y3CI \
  --source praanshuu \
  --network testnet \
  -- mint \
  --to SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF \
  --amount 10000000000
```

### Step 2: Generate Commit Hash
To buy a ticket, you need to:
1. Generate a secret seed (32 bytes)
2. Compute: `commit_hash = SHA256(seed || participant_address || round_id)`
3. Store the seed for later reveal

**Example in JavaScript**:
```javascript
const crypto = require('crypto');

// Generate seed
const seed = crypto.randomBytes(32);

// Compute commit hash
const participant = "SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF";
const roundId = 1;

const hashInput = Buffer.concat([
  seed,
  Buffer.from(participant),
  Buffer.from(roundId.toString())
]);

const commitHash = crypto.createHash('sha256').update(hashInput).digest();
```

### Step 3: Approve Token Transfer
```bash
stellar contract invoke \
  --id CBL6QNUKJAQVYJRL2M2SVHND2F7XAFBDSE77P7TLX5JXBYA7WSS7Y3CI \
  --source praanshuu \
  --network testnet \
  -- approve \
  --from SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF \
  --spender CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV \
  --amount 1000000 \
  --expiration_ledger 100000
```

### Step 4: Buy Ticket
```bash
# Buy ticket with commit hash
stellar contract invoke \
  --id CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV \
  --source praanshuu \
  --network testnet \
  -- buy_ticket \
  --round_id 1 \
  --participant SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF \
  --amount 1000000 \
  --commit_hash <32_BYTE_HEX_STRING>
```

### Step 5: Wait for Round to End
Wait until `end_time` (currently: 1761999374) before revealing seeds.

### Step 6: Reveal Seed
```bash
# After end_time, reveal your seed
stellar contract invoke \
  --id CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV \
  --source praanshuu \
  --network testnet \
  -- reveal_seed \
  --round_id 1 \
  --participant SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF \
  --seed <YOUR_STORED_SEED_HEX>
```

### Step 7: Finalize Round (After Reveal Deadline)
```bash
# After reveal_deadline (currently: 1762085774), finalize the round
stellar contract invoke \
  --id CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV \
  --source praanshuu \
  --network testnet \
  -- finalize_round \
  --round_id 1
```

---

## 📊 Current Status

- ✅ **Contract**: Deployed and initialized
- ✅ **Token**: Deployed and ready
- ✅ **Round**: Created and active (Round ID: 1)
- ✅ **Tickets**: 1 ticket purchased successfully!
  - Participant: SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF
  - Ticket Price: 1,000,000 stroops (0.1 XLM)
  - Commit Hash: 71C005B01D012DE0BBE0126413EDE74906DDB9E0A1BEBCC9564EEC51A5DBD945
  - Seed (saved in test_seed.txt): E78E2C6BF58BCA23FD02A1D1D3496761C42AECA87BABF699A16D0C294C64F44A
- ⏳ **Reveals**: Waiting for round to end (end_time: 1761999374)
- ⏳ **Finalization**: Waiting for reveal deadline (reveal_deadline: 1762085774)

---

## 🔍 Verification Commands

### View Round Details
```bash
stellar contract invoke \
  --id CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV \
  --source praanshuu \
  --network testnet \
  -- view_round \
  --round_id 1
```

### Check Token Balance
```bash
stellar contract invoke \
  --id CBL6QNUKJAQVYJRL2M2SVHND2F7XAFBDSE77P7TLX5JXBYA7WSS7Y3CI \
  --source praanshuu \
  --network testnet \
  -- balance \
  --id SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF
```

---

## 🌐 Explorer Links

- **Lottery Contract**: https://stellar.expert/explorer/testnet/contract/CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV
- **Token Contract**: https://stellar.expert/explorer/testnet/contract/CBL6QNUKJAQVYJRL2M2SVHND2F7XAFBDSE77P7TLX5JXBYA7WSS7Y3CI

---

## ✅ Success Criteria Met

1. ✅ Contract deployed to testnet
2. ✅ Contract initialized with admin and token
3. ✅ Round created successfully
4. ✅ Contract functions responding to queries
5. ✅ Real-time blockchain data being used
6. ✅ All transactions confirmed on testnet
7. ✅ **Ticket purchased successfully with real transaction!**
8. ✅ Token approval and transfer working correctly

**The contract is now live on Stellar Testnet with real-time transactions!** 🎉

## 🎯 Remaining Testing Steps

### For Quick Testing (Cheap Tickets)
If you want to test with cheaper tickets, you can wait for the current round to end and create a new round with a lower price:

```bash
# Create a new round with very cheap tickets (100 stroops = 0.00001 XLM)
stellar contract invoke \
  --id CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV \
  --source praanshuu \
  --network testnet \
  -- create_round \
  --ticket_price 100 \
  --duration_hours 1 \
  --allow_multiple false
```

### Next Steps to Complete Testing

1. **Wait for Round to End** (or create a new short-duration round)
   - Current round end_time: 1761999374
   - Check current time to calculate wait

2. **Reveal Seed** (After end_time but before reveal_deadline)
   ```bash
   stellar contract invoke \
     --id CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV \
     --source praanshuu \
     --network testnet \
     -- reveal_seed \
     --round_id 1 \
     --participant SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF \
     --seed <READ_FROM_test_seed.txt>
   ```

3. **Finalize Round** (After reveal_deadline)
   ```bash
   stellar contract invoke \
     --id CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV \
     --source praanshuu \
     --network testnet \
     -- finalize_round \
     --round_id 1
   ```

