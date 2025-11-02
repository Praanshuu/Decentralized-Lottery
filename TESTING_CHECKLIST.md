# Testing Checklist - Real-Time Testnet Testing

## ✅ Completed Items

- [x] **Deploy contract to testnet**
  - Contract ID: `CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV`
  - Status: ✅ Deployed successfully

- [x] **Deploy token contract**
  - Token ID: `CBL6QNUKJAQVYJRL2M2SVHND2F7XAFBDSE77P7TLX5JXBYA7WSS7Y3CI`
  - Status: ✅ Deployed successfully

- [x] **Initialize contract**
  - Admin: `SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF`
  - Token: `CBL6QNUKJAQVYJRL2M2SVHND2F7XAFBDSE77P7TLX5JXBYA7WSS7Y3CI`
  - Status: ✅ Initialized successfully

- [x] **Create lottery round**
  - Round ID: 1
  - Ticket Price: 1,000,000 stroops (0.1 XLM)
  - Status: ✅ Round created

- [x] **Approve tokens**
  - Amount: 1,000,000 stroops
  - Status: ✅ Approved successfully

- [x] **Purchase ticket**
  - Participant: `SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF`
  - Commit Hash: `71C005B01D012DE0BBE0126413EDE74906DDB9E0A1BEBCC9564EEC51A5DBD945`
  - Seed: `E78E2C6BF58BCA23FD02A1D1D3496761C42AECA87BABF699A16D0C294C64F44A` (saved in test_seed.txt)
  - Status: ✅ Ticket purchased successfully!
  - Round Status: participants_count: 1, total_pool: 1,000,000

## ⏳ Pending Items

- [ ] **Wait for round to end**
  - End Time: 1761999374 (Unix timestamp)
  - Current time: Check with `Get-Date -UFormat %s`
  - Status: ⏳ Waiting...

- [ ] **Reveal seed**
  - Command:
    ```bash
    stellar contract invoke \
      --id CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV \
      --source praanshuu \
      --network testnet \
      -- reveal_seed \
      --round_id 1 \
      --participant SB45VDMW3XV7ZHRGNG5ZWJW6OJTLFRD2X7DEU2SWBMKOUJZG3ZK42ZBF \
      --seed E78E2C6BF58BCA23FD02A1D1D3496761C42AECA87BABF699A16D0C294C64F44A
    ```
  - Status: ⏳ Waiting for round to end

- [ ] **Finalize round**
  - Reveal Deadline: 1762085774 (Unix timestamp)
  - Command:
    ```bash
    stellar contract invoke \
      --id CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV \
      --source praanshuu \
      --network testnet \
      -- finalize_round \
      --round_id 1
    ```
  - Status: ⏳ Waiting for reveal deadline

## 🎯 Quick Test Options

### Option 1: Wait for Current Round
- Round ends at timestamp: 1761999374
- Then reveal seed
- Then wait for reveal_deadline: 1762085774
- Then finalize

### Option 2: Create New Round with Short Duration
Create a new round with very short duration (e.g., 1 minute) for faster testing:

```bash
# First, check if round 1 ended
stellar contract invoke \
  --id CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV \
  --source praanshuu \
  --network testnet \
  -- view_round \
  --round_id 1

# If round 1 is still active, wait or finalize it first
# Then create new round with cheap price and short duration
stellar contract invoke \
  --id CBPXXFNCXGMFOUHGHRKF6OBKTKX7MVGGGNOXJ7LWGNURS74QXTKLK5YV \
  --source praanshuu \
  --network testnet \
  -- create_round \
  --ticket_price 100 \
  --duration_hours 0 \
  --duration_minutes 1 \
  --allow_multiple false
```

## 📝 Saved Files

- `test_seed.txt` - The secret seed for commit-reveal (SAVE THIS!)
- `test_commit_hash.txt` - The commit hash used for ticket purchase

## 📊 Current Round Status

```json
{
  "round_id": 1,
  "ticket_price": "1000000",
  "total_pool": "1000000",
  "participants_count": 1,
  "is_active": true,
  "winner": null,
  "end_time": 1761999374,
  "reveal_deadline": 1762085774,
  "finalized": false,
  "allow_multiple": false
}
```

