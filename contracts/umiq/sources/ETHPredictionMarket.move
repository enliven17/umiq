module umiq::eth_prediction_market {
    use std::signer;
    use std::option::{Self, Option};
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::account;

    /// Errors
    const ENOT_MARKET_OWNER: u64 = 1;
    const EMARKET_NOT_FOUND: u64 = 2;
    const EMARKET_ALREADY_RESOLVED: u64 = 3;
    const EMARKET_NOT_RESOLVED: u64 = 4;
    const EINVALID_BET_AMOUNT: u64 = 5;
    const EALREADY_BET: u64 = 6;
    const ENOT_BET_PLACED: u64 = 7;
    const EINVALID_OUTCOME: u64 = 8;
    const EMARKET_EXPIRED: u64 = 9;
    const EMARKET_NOT_EXPIRED: u64 = 10;

    /// Market struct
    struct Market has key, store {
        id: u64,
        title: vector<u8>,
        description: vector<u8>,
        owner: address,
        total_bets_yes: u64,
        total_bets_no: u64,
        total_pool: u64,
        end_time: u64,
        result: Option<bool>,
        resolved: bool,
        created_at: u64,
    }

    /// Bet struct
    struct Bet has key, store, drop {
        market_id: u64,
        user: address,
        amount: u64,
        prediction: bool, // true for yes, false for no
        placed_at: u64,
    }

    /// Events
    struct MarketCreatedEvent has drop, store {
        market_id: u64,
        title: vector<u8>,
        owner: address,
        end_time: u64,
    }

    struct BetPlacedEvent has drop, store {
        market_id: u64,
        user: address,
        amount: u64,
        prediction: bool,
    }

    struct MarketResolvedEvent has drop, store {
        market_id: u64,
        outcome: bool,
        total_pool: u64,
    }

    struct RewardClaimedEvent has drop, store {
        market_id: u64,
        user: address,
        amount: u64,
    }

    /// Global storage
    struct PredictionMarket has key {
        markets: vector<Market>,
        next_market_id: u64,
        market_created_events: EventHandle<MarketCreatedEvent>,
        bet_placed_events: EventHandle<BetPlacedEvent>,
        market_resolved_events: EventHandle<MarketResolvedEvent>,
        reward_claimed_events: EventHandle<RewardClaimedEvent>,
    }

    /// Initialize the module
    fun init_module(account: &signer) {
        let account_addr = signer::address_of(account);
        
        move_to(account, PredictionMarket {
            markets: vector::empty(),
            next_market_id: 0,
            market_created_events: account::new_event_handle<MarketCreatedEvent>(account),
            bet_placed_events: account::new_event_handle<BetPlacedEvent>(account),
            market_resolved_events: account::new_event_handle<MarketResolvedEvent>(account),
            reward_claimed_events: account::new_event_handle<RewardClaimedEvent>(account),
        });
    }

    /// Create a new prediction market
    public entry fun create_market(
        account: &signer,
        title: vector<u8>,
        description: vector<u8>,
        end_time: u64,
    ) acquires PredictionMarket {
        let account_addr = signer::address_of(account);
        let prediction_market = borrow_global_mut<PredictionMarket>(@umiq);
        
        let market_id = prediction_market.next_market_id;
        prediction_market.next_market_id = prediction_market.next_market_id + 1;

        let market = Market {
            id: market_id,
            title,
            description,
            owner: account_addr,
            total_bets_yes: 0,
            total_bets_no: 0,
            total_pool: 0,
            end_time,
            result: option::none(),
            resolved: false,
            created_at: timestamp::now_seconds(),
        };

        vector::push_back(&mut prediction_market.markets, market);

        event::emit_event(
            &mut prediction_market.market_created_events,
            MarketCreatedEvent {
                market_id,
                title: vector::empty(), // We'll emit the title separately
                owner: account_addr,
                end_time,
            },
        );
    }

    /// Place a bet on a market
    public entry fun place_bet(
        account: &signer,
        market_id: u64,
        prediction: bool,
        amount: u64,
    ) acquires PredictionMarket {
        let account_addr = signer::address_of(account);
        let prediction_market = borrow_global_mut<PredictionMarket>(@umiq);
        
        let market = get_market_by_id_mut(&mut prediction_market.markets, market_id);
        
        assert!(!market.resolved, EMARKET_ALREADY_RESOLVED);
        assert!(timestamp::now_seconds() < market.end_time, EMARKET_EXPIRED);
        assert!(amount > 0, EINVALID_BET_AMOUNT);

        // Update market totals
        if (prediction) {
            market.total_bets_yes = market.total_bets_yes + amount;
        } else {
            market.total_bets_no = market.total_bets_no + amount;
        };
        market.total_pool = market.total_pool + amount;

        // Create bet record
        let bet = Bet {
            market_id,
            user: account_addr,
            amount,
            prediction,
            placed_at: timestamp::now_seconds(),
        };

        // Store bet (in a real implementation, you'd store this in a map)
        // For simplicity, we'll just emit an event

        event::emit_event(
            &mut prediction_market.bet_placed_events,
            BetPlacedEvent {
                market_id,
                user: account_addr,
                amount,
                prediction,
            },
        );
    }

    /// Resolve a market
    public entry fun resolve_market(
        account: &signer,
        market_id: u64,
        outcome: bool,
    ) acquires PredictionMarket {
        let account_addr = signer::address_of(account);
        let prediction_market = borrow_global_mut<PredictionMarket>(@umiq);
        
        let market = get_market_by_id_mut(&mut prediction_market.markets, market_id);
        
        assert!(market.owner == account_addr, ENOT_MARKET_OWNER);
        assert!(!market.resolved, EMARKET_ALREADY_RESOLVED);
        assert!(timestamp::now_seconds() >= market.end_time, EMARKET_NOT_EXPIRED);

        market.result = option::some(outcome);
        market.resolved = true;

        event::emit_event(
            &mut prediction_market.market_resolved_events,
            MarketResolvedEvent {
                market_id,
                outcome,
                total_pool: market.total_pool,
            },
        );
    }

    /// Claim rewards (simplified - in real implementation you'd calculate actual rewards)
    public entry fun claim_rewards(
        account: &signer,
        market_id: u64,
    ) acquires PredictionMarket {
        let account_addr = signer::address_of(account);
        let prediction_market = borrow_global_mut<PredictionMarket>(@umiq);
        
        let market = get_market_by_id(&prediction_market.markets, market_id);
        
        assert!(market.resolved, EMARKET_NOT_RESOLVED);
        assert!(option::is_some(&market.result), EMARKET_NOT_RESOLVED);

        // In a real implementation, you'd calculate the actual reward based on the bet
        // For now, we'll just emit an event
        let reward_amount = 1000; // Placeholder

        event::emit_event(
            &mut prediction_market.reward_claimed_events,
            RewardClaimedEvent {
                market_id,
                user: account_addr,
                amount: reward_amount,
            },
        );
    }

    /// Helper function to get market by ID
    fun get_market_by_id(markets: &vector<Market>, market_id: u64): &Market {
        let i = 0;
        let len = vector::length(markets);
        
        while (i < len) {
            let market = vector::borrow(markets, i);
            if (market.id == market_id) {
                return market;
            };
            i = i + 1;
        };
        
        abort EMARKET_NOT_FOUND
    }

    /// Helper function to get market by ID (mutable)
    fun get_market_by_id_mut(markets: &mut vector<Market>, market_id: u64): &mut Market {
        let i = 0;
        let len = vector::length(markets);
        
        while (i < len) {
            let market = vector::borrow_mut(markets, i);
            if (market.id == market_id) {
                return market;
            };
            i = i + 1;
        };
        
        abort EMARKET_NOT_FOUND
    }

    /// View functions
    public fun get_market_count(): u64 acquires PredictionMarket {
        let prediction_market = borrow_global<PredictionMarket>(@umiq);
        vector::length(&prediction_market.markets)
    }

    public fun get_market_info(market_id: u64): (vector<u8>, vector<u8>, address, u64, u64, u64, u64, bool) acquires PredictionMarket {
        let prediction_market = borrow_global<PredictionMarket>(@umiq);
        let market = get_market_by_id(&prediction_market.markets, market_id);
        
        (
            market.title,
            market.description,
            market.owner,
            market.total_bets_yes,
            market.total_bets_no,
            market.total_pool,
            market.end_time,
            market.resolved
        )
    }
} 