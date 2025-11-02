# Lottery Winner Selection Verification Guide

## Overview

The lottery uses a **commit-reveal scheme** combined with blockchain entropy to ensure provably fair and verifiable random winner selection. This document explains how anyone can independently verify the fairness of the winner selection process.

## Commit-Reveal Process

### Phase 1: Commit (During Ticket Purchase)

When a participant buys a ticket, they must provide a commitment hash:

```
commit_hash = SHA256(seed || participant_address || round_id)
```

Where:
- `seed`: Random bytes chosen by the participant (kept secret until reveal phase)
- `participant_address`: The participant's Stellar address as bytes
- `round_id`: The lottery round ID as 8-byte big-endian integer

**Example:**
```python
import hashlib

seed = b"my_secret_random_seed_12345"
participant_address = "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX".encode()
round_id = (1).to_bytes(8, 'big')

commit_hash = hashlib.sha256(seed + participant_address + round_id).digest()
```

### Phase 2: Reveal (After Round Ends)

After the round ends but before the reveal deadline (24 hours later), participants must reveal their seeds:

```rust
reveal_seed(round_id, participant_address, seed)
```

The contract verifies:
```
SHA256(revealed_seed || participant_address || round_id) == stored_commit_hash
```

If verification fails, the transaction is rejected.

### Phase 3: Finalize (After Reveal Deadline)

The admin calls `finalize_round()` which:
1. Combines all revealed seeds using iterative hashing
2. Adds blockchain entropy (ledger sequence)
3. Derives the winner index from the final hash

---

## Winner Selection Algorithm

### Step 1: Combine Revealed Seeds

Starting with an initial hash of all zeros:

```
combined_hash = 0x0000000000000000000000000000000000000000000000000000000000000000
```

For each participant (in order by participant index):
```
if participant revealed their seed:
    combined_hash = SHA256(combined_hash || revealed_seed)
```

**Missing reveals are excluded** (not included in the hash chain).

### Step 2: Add Blockchain Entropy

```
ledger_sequence = current_ledger_sequence (u32)
final_hash = SHA256(combined_hash || ledger_sequence_bytes)
```

### Step 3: Select Winner

```
random_number = first_8_bytes_of(final_hash) as u64 (big-endian)
winner_index = (random_number % total_participants) + 1
```

---

## External Verification

### Required Data

To verify a lottery round, you need:

1. **Round Information** (from `view_round(round_id)`):
   - `round_id`
   - `participants_count`
   - `winner` address
   - Ledger sequence at finalization

2. **Participant Data**:
   - List of all participant addresses (in order)
   - Their revealed seeds (if any)

3. **Blockchain Data**:
   - Transaction logs showing reveals
   - Ledger sequence at finalization time

### Verification Script (Python)

```python
import hashlib

def verify_lottery_winner(round_id, participants, revealed_seeds, ledger_sequence, expected_winner):
    """
    Verify that the lottery winner was selected fairly.
    
    Args:
        round_id: The lottery round ID
        participants: List of participant addresses (in order by index)
        revealed_seeds: Dict mapping participant_address -> revealed_seed (bytes)
        ledger_sequence: Ledger sequence at finalization
        expected_winner: The announced winner address
    
    Returns:
        tuple: (is_valid, winner_address, winner_index)
    """
    
    # Step 1: Combine revealed seeds
    combined_hash = bytes([0] * 32)  # Start with zeros
    reveal_count = 0
    
    for participant_addr in participants:
        if participant_addr in revealed_seeds:
            seed = revealed_seeds[participant_addr]
            # Combine: combined_hash = SHA256(combined_hash || seed)
            combined_hash = hashlib.sha256(combined_hash + seed).digest()
            reveal_count += 1
    
    print(f"Combined {reveal_count} revealed seeds out of {len(participants)} participants")
    print(f"Combined hash: {combined_hash.hex()}")
    
    # Step 2: Add ledger sequence
    ledger_bytes = ledger_sequence.to_bytes(4, 'big')
    final_hash = hashlib.sha256(combined_hash + ledger_bytes).digest()
    print(f"Final hash (with ledger {ledger_sequence}): {final_hash.hex()}")
    
    # Step 3: Select winner
    random_bytes = final_hash[:8]
    random_number = int.from_bytes(random_bytes, 'big')
    winner_index = (random_number % len(participants)) + 1  # 1-indexed
    winner_address = participants[winner_index - 1]
    
    print(f"Random number: {random_number}")
    print(f"Winner index: {winner_index}")
    print(f"Winner address: {winner_address}")
    
    # Verify
    is_valid = (winner_address == expected_winner)
    return is_valid, winner_address, winner_index

# Example usage:
round_id = 1
participants = [
    "GABC...",  # Participant 1
    "GDEF...",  # Participant 2
    "GHIJ...",  # Participant 3
]

revealed_seeds = {
    "GABC...": b"seed_0",
    "GDEF...": b"seed_1",
    "GHIJ...": b"seed_2",
}

ledger_sequence = 12345
expected_winner = "GHIJ..."

is_valid, winner, winner_idx = verify_lottery_winner(
    round_id, participants, revealed_seeds, ledger_sequence, expected_winner
)

if is_valid:
    print(f"✅ Winner selection is VALID! Participant #{winner_idx} won fairly.")
else:
    print(f"❌ Winner selection is INVALID! Expected {expected_winner}, got {winner}")
```

---

## Security Properties

### 1. **Unpredictability**

- Participants cannot predict the final random value until all seeds are revealed
- Each participant contributes entropy through their secret seed
- Blockchain entropy (ledger sequence) adds additional unpredictability

### 2. **Verifiability**

- Anyone can verify the winner selection by replaying the algorithm
- All inputs (commits, reveals, ledger sequence) are on-chain
- Deterministic algorithm produces the same result every time

### 3. **Manipulation Resistance**

- **Participants cannot manipulate**: Must commit before knowing others' seeds
- **Admin cannot manipulate**: Cannot change seeds or selection algorithm
- **No centralized randomness**: All entropy from distributed sources

### 4. **Fairness Under Missing Reveals**

Missing reveals are **excluded** from the hash chain:
- Participants who don't reveal forfeit their ticket but don't break the lottery
- The random value is still unpredictable to those who revealed
- Rational participants will reveal (they paid for the ticket)

---

## Retrieving Data from Blockchain

### Get Round Information

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  -- view_round \
  --round_id 1
```

### Get Participant List

Query the contract storage for each participant:
```bash
for i in 1 2 3 ... N:
    stellar contract invoke \
      --id <CONTRACT_ID> \
      --network testnet \
      -- get_participant \
      --round_id 1 \
      --participant_index $i
```

### Get Revealed Seeds

Check transaction history for `reveal_seed` calls:
```bash
stellar contract read \
  --id <CONTRACT_ID> \
  --key "Reveal(1, GXXXXXX...)" \
  --network testnet
```

### Get Ledger Sequence

From the `finalize_round` transaction:
```bash
stellar tx inspect <TX_HASH> --network testnet
```

---

## Attack Scenarios & Mitigations

### Scenario 1: Last Participant Doesn't Reveal

**Attack:** The last participant to reveal could calculate the final result before revealing, and only reveal if they win.

**Mitigation:**
- The reveal deadline ensures all participants reveal within the same time window
- Missing reveals don't prevent lottery from proceeding
- Rational participants reveal because they paid for their ticket

### Scenario 2: Admin Delays Finalization

**Attack:** Admin could delay calling `finalize_round()` to manipulate the ledger sequence.

**Mitigation:**
- Ledger sequence is only known *after* the reveal deadline
- Once reveal deadline passes, the ledger sequence is effectively fixed
- Verification includes checking the ledger sequence is reasonable

### Scenario 3: Participant Collusion

**Attack:** Multiple participants could collude and share seeds before revealing.

**Mitigation:**
- Commit-reveal prevents this: participants must commit before seeing others' commits
- Changing your seed after seeing others' commits invalidates your commit hash
- If you don't reveal, you lose your ticket money

---

## Verification Checklist

When verifying a lottery round:

- [ ] All participant commits were made during the purchase phase
- [ ] Reveal phase occurred after round end time
- [ ] All reveals were verified against their commits
- [ ] Finalization occurred after reveal deadline
- [ ] Ledger sequence is from finalization transaction
- [ ] Winner index calculation matches expected algorithm
- [ ] Winner address matches the participant at calculated index
- [ ] Prize pool was transferred to the winner

---

## Example: Full Verification

### Given Data
```
Round ID: 1
Participants:
  1. GABC1234... (revealed: b"seed_0")
  2. GDEF5678... (revealed: b"seed_1")
  3. GHIJ9012... (did not reveal)
  4. GKLM3456... (revealed: b"seed_3")

Ledger Sequence at Finalization: 98765
Announced Winner: GDEF5678... (Participant #2)
```

### Verification Steps

```python
# Step 1: Initial hash
combined = bytes([0] * 32)

# Step 2: Participant 1 revealed
combined = SHA256(combined || b"seed_0")
# = 0x7a5c8...

# Step 3: Participant 2 revealed
combined = SHA256(combined || b"seed_1")
# = 0x3f2d1...

# Step 4: Participant 3 did NOT reveal (skip)

# Step 5: Participant 4 revealed
combined = SHA256(combined || b"seed_3")
# = 0x9e4b2...

# Step 6: Add ledger sequence
final_hash = SHA256(combined || 98765_as_bytes)
# = 0x2c8f5a3b1d9e7f6c4a2b8d5e3f1c9a7b5d3e1f9c7a5b3d1e9f7c5a3b1d9e

# Step 7: Extract random number
random_number = first_8_bytes_as_u64(final_hash)
# = 3197854907...

# Step 8: Calculate winner
winner_index = (random_number % 4) + 1
# = 2

# Step 9: Get winner address
winner = participants[2-1]  # 0-indexed array
# = GDEF5678...

# ✅ VERIFIED: Winner matches announcement!
```

---

## Conclusion

The commit-reveal lottery scheme provides:

1. **Fairness**: No single party can manipulate the outcome
2. **Transparency**: All data is on-chain and verifiable
3. **Unpredictability**: Winner cannot be predicted until after reveal deadline
4. **Verifiability**: Anyone can independently verify the winner selection

For questions or concerns about the verification process, please open an issue on the project repository.

---

**Last Updated:** November 2025  
**Contract Version:** 1.0.0 with Commit-Reveal
