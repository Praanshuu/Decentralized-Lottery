#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, token, Address, Env, Vec, Bytes, BytesN};

// Helper function to create test token
fn create_token_contract<'a>(env: &Env, admin: &Address) -> (token::Client<'a>, token::StellarAssetClient<'a>) {
    let contract_address = env.register_stellar_asset_contract_v2(admin.clone());
    (
        token::Client::new(env, &contract_address.address()),
        token::StellarAssetClient::new(env, &contract_address.address()),
    )
}

// Helper function to create commit hash: sha256(seed || address || round_id)
fn create_commit_hash(env: &Env, seed: &Bytes, address: &Address, round_id: u64) -> BytesN<32> {
    let mut hash_input = Bytes::new(env);
    hash_input.append(seed);
    let addr_bytes: Bytes = address.to_string().to_bytes();
    hash_input.append(&addr_bytes);
    hash_input.append(&Bytes::from_slice(env, &round_id.to_be_bytes()));
    env.crypto().sha256(&hash_input).into()
}

#[test]
fn test_init_admin() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, _) = create_token_contract(&env, &token_admin);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    // Initialize contract
    client.init_admin(&admin, &token.address);
    
    // Verify we can create a round (only admin can do this)
    let round_id = client.create_round(&100, &24, &false);
    assert_eq!(round_id, 1);
}

#[test]
#[should_panic(expected = "Contract already initialized")]
fn test_init_admin_twice_fails() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, _) = create_token_contract(&env, &token_admin);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    // Initialize contract
    client.init_admin(&admin, &token.address);
    
    // Try to initialize again - should panic
    client.init_admin(&admin, &token.address);
}

#[test]
fn test_create_round() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, _) = create_token_contract(&env, &token_admin);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    client.init_admin(&admin, &token.address);
    
    // Create a round
    let ticket_price = 100;
    let duration_hours = 24;
    let round_id = client.create_round(&ticket_price, &duration_hours, &false);
    
    assert_eq!(round_id, 1);
    
    // Verify round details
    let round = client.view_round(&round_id);
    assert_eq!(round.round_id, 1);
    assert_eq!(round.ticket_price, 100);
    assert_eq!(round.total_pool, 0);
    assert_eq!(round.participants_count, 0);
    assert_eq!(round.is_active, true);
}

#[test]
#[should_panic(expected = "Cannot create new round. Active round exists")]
fn test_cannot_create_multiple_active_rounds() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, _) = create_token_contract(&env, &token_admin);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    client.init_admin(&admin, &token.address);
    
    // Create first round
    client.create_round(&100, &24, &false);
    
    // Try to create second round while first is active - should panic
    client.create_round(&200, &48, &false);
}

#[test]
fn test_buy_ticket() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    
    let participant = Address::generate(&env);
    
    // Mint tokens to participant
    token_admin_client.mint(&participant, &1000);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    client.init_admin(&admin, &token.address);
    
    // Create a round
    let ticket_price = 100;
    let round_id = client.create_round(&ticket_price, &24, &false);
    
    // Buy ticket with commit hash
    let seed = Bytes::from_slice(&env, b"test_seed_123");
    let commit_hash = create_commit_hash(&env, &seed, &participant, round_id);
    client.buy_ticket(&round_id, &participant, &ticket_price, &commit_hash);
    
    // Verify round updated
    let round = client.view_round(&round_id);
    assert_eq!(round.participants_count, 1);
    assert_eq!(round.total_pool, 100);
    
    // Verify tokens transferred
    assert_eq!(token.balance(&participant), 900);
    assert_eq!(token.balance(&contract_id), 100);
}

#[test]
#[should_panic(expected = "Incorrect payment amount")]
fn test_buy_ticket_wrong_amount() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    
    let participant = Address::generate(&env);
    token_admin_client.mint(&participant, &1000);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    client.init_admin(&admin, &token.address);
    
    let round_id = client.create_round(&100, &24, &false);
    
    // Try to buy ticket with wrong amount - should panic
    let seed = Bytes::from_slice(&env, b"test_seed");
    let commit_hash = create_commit_hash(&env, &seed, &participant, round_id);
    client.buy_ticket(&round_id, &participant, &50, &commit_hash);
}

#[test]
fn test_multiple_participants() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    client.init_admin(&admin, &token.address);
    
    let ticket_price = 100;
    let round_id = client.create_round(&ticket_price, &24, &true);
    
    // Create multiple participants
    let seed_strings = [b"seed_0", b"seed_1", b"seed_2", b"seed_3", b"seed_4"];
    for i in 0..5 {
        let participant = Address::generate(&env);
        token_admin_client.mint(&participant, &1000);
        let seed = Bytes::from_slice(&env, seed_strings[i]);
        let commit_hash = create_commit_hash(&env, &seed, &participant, round_id);
        client.buy_ticket(&round_id, &participant, &ticket_price, &commit_hash);
    }
    
    // Verify round updated
    let round = client.view_round(&round_id);
    assert_eq!(round.participants_count, 5);
    assert_eq!(round.total_pool, 500);
}

#[test]
fn test_commit_reveal_finalize() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    client.init_admin(&admin, &token.address);
    
    // Create round with 1 hour duration
    let ticket_price = 100;
    let round_id = client.create_round(&ticket_price, &1, &false);
    
    // Add participants with commits
    let mut participants = Vec::new(&env);
    let mut seeds = Vec::new(&env);
    let seed_strings = [b"seed_0", b"seed_1", b"seed_2"];
    for i in 0..3 {
        let participant = Address::generate(&env);
        token_admin_client.mint(&participant, &1000);
        let seed = Bytes::from_slice(&env, seed_strings[i]);
        let commit_hash = create_commit_hash(&env, &seed, &participant, round_id);
        client.buy_ticket(&round_id, &participant, &ticket_price, &commit_hash);
        participants.push_back(participant.clone());
        seeds.push_back(seed);
    }
    
    // Fast forward time past round end but before reveal deadline
    env.ledger().with_mut(|li| {
        li.timestamp += 3600 + 1; // 1 hour + 1 second
    });
    
    // All participants reveal their seeds
    for i in 0..3 {
        let participant = participants.get(i as u32).unwrap();
        let seed = seeds.get(i as u32).unwrap();
        client.reveal_seed(&round_id, &participant, &seed);
    }
    
    // Fast forward past reveal deadline
    env.ledger().with_mut(|li| {
        li.timestamp += 24 * 3600 + 1; // 24 hours + 1 second
    });
    
    // Finalize round and draw winner
    let winner = client.finalize_round(&round_id);
    
    // Verify winner is one of the participants
    assert!(participants.contains(&winner));
    
    // Verify round is closed and finalized
    let round = client.view_round(&round_id);
    assert_eq!(round.is_active, false);
    assert_eq!(round.finalized, true);
    assert!(round.winner.is_some());
    
    // Verify winner received tokens (they also bought a ticket)
    // Winner had 1000, spent 100 on ticket, received 300 prize = 1200
    assert_eq!(token.balance(&winner), 1200);
}

#[test]
#[should_panic(expected = "Reveal deadline has not passed yet")]
fn test_cannot_finalize_before_reveal_deadline() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    client.init_admin(&admin, &token.address);
    
    let round_id = client.create_round(&100, &1, &false);
    
    // Add a participant
    let participant = Address::generate(&env);
    token_admin_client.mint(&participant, &1000);
    let seed = Bytes::from_slice(&env, b"seed");
    let commit_hash = create_commit_hash(&env, &seed, &participant, round_id);
    client.buy_ticket(&round_id, &participant, &100, &commit_hash);
    
    // Fast forward past end time but not reveal deadline
    env.ledger().with_mut(|li| {
        li.timestamp += 3600 + 1;
    });
    
    // Try to finalize before reveal deadline - should panic
    client.finalize_round(&round_id);
}

#[test]
#[should_panic(expected = "No participants in this round")]
fn test_cannot_finalize_no_participants() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, _) = create_token_contract(&env, &token_admin);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    client.init_admin(&admin, &token.address);
    
    let round_id = client.create_round(&100, &1, &false);
    
    // Fast forward time past reveal deadline
    env.ledger().with_mut(|li| {
        li.timestamp += 3600 + (24 * 3600) + 1;
    });
    
    // Try to finalize with no participants - should panic
    client.finalize_round(&round_id);
}

#[test]
fn test_reveal_seed() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    client.init_admin(&admin, &token.address);
    
    let round_id = client.create_round(&100, &1, &false);
    
    let participant = Address::generate(&env);
    token_admin_client.mint(&participant, &1000);
    let seed = Bytes::from_slice(&env, b"my_secret_seed");
    let commit_hash = create_commit_hash(&env, &seed, &participant, round_id);
    
    client.buy_ticket(&round_id, &participant, &100, &commit_hash);
    
    // Fast forward past end_time
    env.ledger().with_mut(|li| {
        li.timestamp += 3600 + 1;
    });
    
    // Reveal seed - should succeed
    client.reveal_seed(&round_id, &participant, &seed);
}

#[test]
#[should_panic(expected = "Seed does not match commit")]
fn test_reveal_wrong_seed() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    client.init_admin(&admin, &token.address);
    
    let round_id = client.create_round(&100, &1, &false);
    
    let participant = Address::generate(&env);
    token_admin_client.mint(&participant, &1000);
    let seed = Bytes::from_slice(&env, b"my_secret_seed");
    let commit_hash = create_commit_hash(&env, &seed, &participant, round_id);
    
    client.buy_ticket(&round_id, &participant, &100, &commit_hash);
    
    // Fast forward past end_time
    env.ledger().with_mut(|li| {
        li.timestamp += 3600 + 1;
    });
    
    // Try to reveal wrong seed - should panic
    let wrong_seed = Bytes::from_slice(&env, b"wrong_seed");
    client.reveal_seed(&round_id, &participant, &wrong_seed);
}

#[test]
fn test_finalize_with_missing_reveals() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    client.init_admin(&admin, &token.address);
    
    let ticket_price = 100;
    let round_id = client.create_round(&ticket_price, &1, &false);
    
    // Add 3 participants
    let mut participants = Vec::new(&env);
    let mut seeds = Vec::new(&env);
    let seed_strings = [b"seed_0", b"seed_1", b"seed_2"];
    for i in 0..3 {
        let participant = Address::generate(&env);
        token_admin_client.mint(&participant, &1000);
        let seed = Bytes::from_slice(&env, seed_strings[i]);
        let commit_hash = create_commit_hash(&env, &seed, &participant, round_id);
        client.buy_ticket(&round_id, &participant, &ticket_price, &commit_hash);
        participants.push_back(participant.clone());
        seeds.push_back(seed);
    }
    
    // Fast forward past end time
    env.ledger().with_mut(|li| {
        li.timestamp += 3600 + 1;
    });
    
    // Only 2 out of 3 participants reveal
    for i in 0..2 {
        let participant = participants.get(i as u32).unwrap();
        let seed = seeds.get(i as u32).unwrap();
        client.reveal_seed(&round_id, &participant, &seed);
    }
    
    // Fast forward past reveal deadline
    env.ledger().with_mut(|li| {
        li.timestamp += 24 * 3600 + 1;
    });
    
    // Finalize should still work with missing reveals
    let winner = client.finalize_round(&round_id);
    
    // Winner should be one of the participants
    assert!(participants.contains(&winner));
    
    // Verify finalization
    let round = client.view_round(&round_id);
    assert_eq!(round.finalized, true);
    assert_eq!(round.is_active, false);
}

#[test]
fn test_allow_multiple_tickets_true() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    client.init_admin(&admin, &token.address);
    
    let ticket_price = 100;
    let round_id = client.create_round(&ticket_price, &24, &true); // Allow multiple
    
    let participant = Address::generate(&env);
    token_admin_client.mint(&participant, &1000);
    
    // Buy first ticket
    let seed1 = Bytes::from_slice(&env, b"seed1");
    let commit1 = create_commit_hash(&env, &seed1, &participant, round_id);
    client.buy_ticket(&round_id, &participant, &ticket_price, &commit1);
    
    // Buy second ticket - should succeed
    let seed2 = Bytes::from_slice(&env, b"seed2");
    let commit2 = create_commit_hash(&env, &seed2, &participant, round_id);
    client.buy_ticket(&round_id, &participant, &ticket_price, &commit2);
    
    // Verify 2 tickets purchased
    let round = client.view_round(&round_id);
    assert_eq!(round.participants_count, 2);
    assert_eq!(round.total_pool, 200);
}

#[test]
#[should_panic(expected = "Participant already bought a ticket for this round")]
fn test_allow_multiple_tickets_false() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    client.init_admin(&admin, &token.address);
    
    let ticket_price = 100;
    let round_id = client.create_round(&ticket_price, &24, &false); // Disallow multiple
    
    let participant = Address::generate(&env);
    token_admin_client.mint(&participant, &1000);
    
    // Buy first ticket
    let seed1 = Bytes::from_slice(&env, b"seed1");
    let commit1 = create_commit_hash(&env, &seed1, &participant, round_id);
    client.buy_ticket(&round_id, &participant, &ticket_price, &commit1);
    
    // Try to buy second ticket - should panic
    let seed2 = Bytes::from_slice(&env, b"seed2");
    let commit2 = create_commit_hash(&env, &seed2, &participant, round_id);
    client.buy_ticket(&round_id, &participant, &ticket_price, &commit2);
}

#[test]
#[should_panic(expected = "Contract not initialized")]
fn test_unauthorized_admin_create_round() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    // Try to create round without initializing - should panic
    client.create_round(&100, &24, &false);
}

#[test]
fn test_full_lottery_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    // 1. Initialize
    client.init_admin(&admin, &token.address);
    
    // 2. Create round
    let ticket_price = 100;
    let round_id = client.create_round(&ticket_price, &1, &false);
    assert_eq!(round_id, 1);
    
    // 3. Multiple participants buy tickets
    let mut participants = Vec::new(&env);
    let mut seeds = Vec::new(&env);
    let seed_strings = [b"seed_a", b"seed_b", b"seed_c"];
    
    for i in 0..3 {
        let participant = Address::generate(&env);
        token_admin_client.mint(&participant, &1000);
        let seed = Bytes::from_slice(&env, seed_strings[i]);
        let commit = create_commit_hash(&env, &seed, &participant, round_id);
        client.buy_ticket(&round_id, &participant, &ticket_price, &commit);
        participants.push_back(participant);
        seeds.push_back(seed);
    }
    
    // 4. Verify tickets purchased
    let round_after_purchase = client.view_round(&round_id);
    assert_eq!(round_after_purchase.participants_count, 3);
    assert_eq!(round_after_purchase.total_pool, 300);
    assert_eq!(round_after_purchase.is_active, true);
    
    // 5. Fast forward past end time
    env.ledger().with_mut(|li| {
        li.timestamp += 3600 + 1;
    });
    
    // 6. Participants reveal seeds
    for i in 0..3 {
        let participant = participants.get(i as u32).unwrap();
        let seed = seeds.get(i as u32).unwrap();
        client.reveal_seed(&round_id, &participant, &seed);
    }
    
    // 7. Fast forward past reveal deadline
    env.ledger().with_mut(|li| {
        li.timestamp += 24 * 3600 + 1;
    });
    
    // 8. Finalize and verify winner
    let winner = client.finalize_round(&round_id);
    assert!(participants.contains(&winner));
    
    // 9. Verify final state
    let final_round = client.view_round(&round_id);
    assert_eq!(final_round.is_active, false);
    assert_eq!(final_round.finalized, true);
    assert!(final_round.winner.is_some());
    
    // 10. Verify winner received prize
    assert_eq!(token.balance(&winner), 1200); // 1000 - 100 + 300
}

#[test]
fn test_token_payment_mock() {
    let env = Env::default();
    env.mock_all_auths();
    
    let admin = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    
    let participant = Address::generate(&env);
    token_admin_client.mint(&participant, &1000);
    
    let contract_id = env.register(LotteryContract, ());
    let client = LotteryContractClient::new(&env, &contract_id);
    
    client.init_admin(&admin, &token.address);
    let round_id = client.create_round(&100, &24, &false);
    
    // Verify initial balances
    assert_eq!(token.balance(&participant), 1000);
    assert_eq!(token.balance(&contract_id), 0);
    
    // Buy ticket
    let seed = Bytes::from_slice(&env, b"seed");
    let commit = create_commit_hash(&env, &seed, &participant, round_id);
    client.buy_ticket(&round_id, &participant, &100, &commit);
    
    // Verify balances after purchase
    assert_eq!(token.balance(&participant), 900);
    assert_eq!(token.balance(&contract_id), 100);
}
