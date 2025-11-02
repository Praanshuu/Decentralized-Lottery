#![allow(non_snake_case)]
#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, log, Env, Address, Symbol, token, symbol_short, BytesN, Bytes};

// Structure to store lottery round details
#[contracttype]
#[derive(Clone)]
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

// Admin address
const ADMIN: Symbol = symbol_short!("ADMIN");

// Counter for lottery rounds
const ROUND_COUNT: Symbol = symbol_short!("R_COUNT");

// Current active round
const ACTIVE_ROUND: Symbol = symbol_short!("ACT_RND");

// Token address for payments
const TOKEN: Symbol = symbol_short!("TOKEN");

// Mapping round ID to LotteryRound struct
#[contracttype]
pub enum RoundBook {
    Round(u64)
}

// Mapping round ID and participant index to Address
#[contracttype]
pub enum ParticipantBook {
    Participant(u64, u64) // (round_id, participant_index)
}

// Mapping (round_id, participant_address) to commit hash
#[contracttype]
pub enum CommitBook {
    Commit(u64, Address)
}

// Mapping (round_id, participant_address) to revealed seed
#[contracttype]
pub enum RevealBook {
    Reveal(u64, Address)
}

// Mapping (round_id, participant_address) to bool for duplicate checking
#[contracttype]
pub enum ParticipantMap {
    HasTicket(u64, Address)
}

#[contract]
pub struct LotteryContract;

#[contractimpl]
impl LotteryContract {
    
    // Initialize the contract with an admin
    pub fn init_admin(env: Env, admin: Address, token: Address) {
        // Check if already initialized
        if env.storage().instance().has(&ADMIN) {
            log!(&env, "Contract already initialized!");
            panic!("Contract already initialized!");
        }
        
        admin.require_auth();
        
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&TOKEN, &token);
        env.storage().instance().extend_ttl(100000, 100000);
        
        log!(&env, "Contract initialized with admin");
    }
    
    // Helper function to require admin authorization
    fn require_admin(env: &Env) {
        let admin: Address = env.storage().instance()
            .get(&ADMIN)
            .expect("Contract not initialized");
        admin.require_auth();
    }
    
    // Create a new lottery round
    pub fn create_round(env: Env, ticket_price: i128, duration_hours: u64, allow_multiple: bool) -> u64 {
        Self::require_admin(&env);
        
        // Check if there's an active round
        let active_round_id: u64 = env.storage().instance().get(&ACTIVE_ROUND).unwrap_or(0);
        if active_round_id != 0 {
            let active_round = Self::view_round(env.clone(), active_round_id);
            if active_round.is_active {
                log!(&env, "Cannot create new round. Active round exists!");
                panic!("Cannot create new round. Active round exists!");
            }
        }
        
        let mut round_count: u64 = env.storage().instance().get(&ROUND_COUNT).unwrap_or(0);
        round_count += 1;
        
        let current_time = env.ledger().timestamp();
        let end_time = current_time + (duration_hours * 3600); // Convert hours to seconds
        let reveal_deadline = end_time + (24 * 3600); // 24 hours after end_time for reveals
        
        let new_round = LotteryRound {
            round_id: round_count,
            ticket_price,
            total_pool: 0,
            participants_count: 0,
            is_active: true,
            winner: None,
            end_time,
            reveal_deadline,
            finalized: false,
            allow_multiple,
        };
        
        env.storage().instance().set(&RoundBook::Round(round_count), &new_round);
        env.storage().instance().set(&ROUND_COUNT, &round_count);
        env.storage().instance().set(&ACTIVE_ROUND, &round_count);
        env.storage().instance().extend_ttl(10000, 10000);
        
        log!(&env, "Lottery Round {} Created with ticket price: {}", round_count, ticket_price);
        round_count
    }
    
    // Buy a lottery ticket with payment and commit hash
    pub fn buy_ticket(env: Env, round_id: u64, participant: Address, amount: i128, commit_hash: BytesN<32>) {
        participant.require_auth();
        
        let mut round = Self::view_round(env.clone(), round_id);
        
        if round.round_id == 0 {
            log!(&env, "Lottery round not found!");
            panic!("Lottery round not found!");
        }
        
        if !round.is_active {
            log!(&env, "Lottery round is not active!");
            panic!("Lottery round is not active!");
        }
        
        let current_time = env.ledger().timestamp();
        if current_time >= round.end_time {
            log!(&env, "Lottery round has ended!");
            panic!("Lottery round has ended!");
        }
        
        // Check for duplicate tickets if multiple tickets not allowed
        if !round.allow_multiple {
            let participant_map_key = ParticipantMap::HasTicket(round_id, participant.clone());
            if env.storage().instance().has(&participant_map_key) {
                log!(&env, "Participant already bought a ticket for this round!");
                panic!("Participant already bought a ticket for this round!");
            }
            // Mark participant as having a ticket
            env.storage().instance().set(&participant_map_key, &true);
        }
        
        // Validate payment amount
        if amount != round.ticket_price {
            log!(&env, "Incorrect payment amount! Expected: {}, Got: {}", round.ticket_price, amount);
            panic!("Incorrect payment amount!");
        }
        
        // Transfer tokens from participant to contract
        let token_address: Address = env.storage().instance()
            .get(&TOKEN)
            .expect("Token not configured");
        let token_client = token::Client::new(&env, &token_address);
        let contract_address = env.current_contract_address();
        
        // Transfer payment from participant to contract
        token_client.transfer(&participant, &contract_address, &amount);
        
        // Update round data
        round.total_pool += amount;
        round.participants_count += 1;
        
        // Store participant
        let participant_key = ParticipantBook::Participant(round_id, round.participants_count);
        env.storage().instance().set(&participant_key, &participant);
        
        // Store commit hash for commit-reveal scheme
        let commit_key = CommitBook::Commit(round_id, participant.clone());
        env.storage().instance().set(&commit_key, &commit_hash);
        
        // Update round
        env.storage().instance().set(&RoundBook::Round(round_id), &round);
        env.storage().instance().extend_ttl(10000, 10000);
        
        log!(&env, "Ticket purchased for Round {} by participant #{}", round_id, round.participants_count);
    }
    
    // Reveal the seed for commit-reveal scheme
    pub fn reveal_seed(env: Env, round_id: u64, participant: Address, seed: Bytes) {
        participant.require_auth();
        
        let round = Self::view_round(env.clone(), round_id);
        
        if round.round_id == 0 {
            log!(&env, "Lottery round not found!");
            panic!("Lottery round not found!");
        }
        
        let current_time = env.ledger().timestamp();
        
        // Must be after end_time but before reveal_deadline
        if current_time < round.end_time {
            log!(&env, "Reveal phase has not started yet!");
            panic!("Reveal phase has not started yet!");
        }
        
        if current_time >= round.reveal_deadline {
            log!(&env, "Reveal deadline has passed!");
            panic!("Reveal deadline has passed!");
        }
        
        // Get stored commit hash
        let commit_key = CommitBook::Commit(round_id, participant.clone());
        let stored_commit: BytesN<32> = env.storage().instance()
            .get(&commit_key)
            .expect("No commit found for this participant");
        
        // Compute hash of seed || participant || round_id
        let mut hash_input = Bytes::new(&env);
        hash_input.append(&seed);
        let addr_bytes: Bytes = participant.to_string().to_bytes();
        hash_input.append(&addr_bytes);
        hash_input.append(&Bytes::from_slice(&env, &round_id.to_be_bytes()));
        
        let computed_hash: BytesN<32> = env.crypto().sha256(&hash_input).into();
        
        // Verify commit
        if computed_hash != stored_commit {
            log!(&env, "Seed does not match commit!");
            panic!("Seed does not match commit!");
        }
        
        // Store revealed seed
        let reveal_key = RevealBook::Reveal(round_id, participant.clone());
        env.storage().instance().set(&reveal_key, &seed);
        env.storage().instance().extend_ttl(10000, 10000);
        
        log!(&env, "Seed revealed for Round {} by participant", round_id);
    }
    
    // Finalize round and draw winner using commit-reveal randomness
    pub fn finalize_round(env: Env, round_id: u64) -> Address {
        Self::require_admin(&env);
        
        let mut round = Self::view_round(env.clone(), round_id);
        
        if round.round_id == 0 {
            log!(&env, "Lottery round not found!");
            panic!("Lottery round not found!");
        }
        
        if !round.is_active {
            log!(&env, "Lottery round is already closed!");
            panic!("Lottery round is already closed!");
        }
        
        if round.finalized {
            log!(&env, "Round already finalized!");
            panic!("Round already finalized!");
        }
        
        if round.participants_count == 0 {
            log!(&env, "No participants in this round!");
            panic!("No participants in this round!");
        }
        
        let current_time = env.ledger().timestamp();
        
        // Must be after reveal_deadline to ensure all reveals are in
        if current_time < round.reveal_deadline {
            log!(&env, "Reveal deadline has not passed yet!");
            panic!("Reveal deadline has not passed yet!");
        }
        
        // Combine all revealed seeds using iterative hashing
        let mut combined_hash = BytesN::<32>::from_array(&env, &[0u8; 32]);
        let mut reveal_count = 0u64;
        
        for i in 1..=round.participants_count {
            let participant_key = ParticipantBook::Participant(round_id, i);
            let participant: Address = env.storage().instance().get(&participant_key).unwrap();
            
            let reveal_key = RevealBook::Reveal(round_id, participant);
            if let Some(revealed_seed) = env.storage().instance().get::<_, Bytes>(&reveal_key) {
                // Combine: h = sha256(h || seed)
                let mut hash_input = Bytes::new(&env);
                let combined_bytes: Bytes = Bytes::from_array(&env, &combined_hash.to_array());
                hash_input.append(&combined_bytes);
                hash_input.append(&revealed_seed);
                combined_hash = env.crypto().sha256(&hash_input).into();
                reveal_count += 1;
            }
            // Missing reveals are treated as zero (not included)
        }
        
        log!(&env, "Combined {} revealed seeds out of {} participants", reveal_count, round.participants_count);
        
        // Add ledger sequence for additional entropy
        let sequence = env.ledger().sequence();
        let mut final_hash_input = Bytes::new(&env);
        let combined_bytes: Bytes = Bytes::from_array(&env, &combined_hash.to_array());
        final_hash_input.append(&combined_bytes);
        final_hash_input.append(&Bytes::from_slice(&env, &sequence.to_be_bytes()));
        let final_random_hash: BytesN<32> = env.crypto().sha256(&final_hash_input).into();
        
        // Convert hash to u64 for selection
        let mut random_bytes = [0u8; 8];
        random_bytes.copy_from_slice(&final_random_hash.to_array()[0..8]);
        let random_number = u64::from_be_bytes(random_bytes);
        let winner_index = (random_number % round.participants_count) + 1;
        
        // Get winner address
        let winner_key = ParticipantBook::Participant(round_id, winner_index);
        let winner: Address = env.storage().instance().get(&winner_key).unwrap();
        
        log!(&env, "Winner selected: Participant #{} with {} reveals", winner_index, reveal_count);
        
        // Transfer prize pool to winner
        if round.total_pool > 0 {
            let token_address: Address = env.storage().instance()
                .get(&TOKEN)
                .expect("Token not configured");
            let token_client = token::Client::new(&env, &token_address);
            let contract_address = env.current_contract_address();
            
            // Transfer tokens from contract to winner
            token_client.transfer(&contract_address, &winner, &round.total_pool);
            log!(&env, "Prize pool of {} transferred to winner", round.total_pool);
        }
        
        // Update round ONLY after successful transfer
        round.is_active = false;
        round.winner = Some(winner.clone());
        round.finalized = true;
        
        env.storage().instance().set(&RoundBook::Round(round_id), &round);
        env.storage().instance().set(&ACTIVE_ROUND, &0u64); // Clear active round
        env.storage().instance().extend_ttl(10000, 10000);
        
        log!(&env, "Round {} finalized. Winner: participant #{}", round_id, winner_index);
        
        winner
    }
    
    // View lottery round details
    pub fn view_round(env: Env, round_id: u64) -> LotteryRound {
        let key = RoundBook::Round(round_id);
        
        env.storage().instance().get(&key).unwrap_or(LotteryRound {
            round_id: 0,
            ticket_price: 0,
            total_pool: 0,
            participants_count: 0,
            is_active: false,
            winner: None,
            end_time: 0,
            reveal_deadline: 0,
            finalized: false,
            allow_multiple: false,
        })
    }
}

mod test;