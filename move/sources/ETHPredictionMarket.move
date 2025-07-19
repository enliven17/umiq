module umiq::eth_prediction_market {
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::coin;
    use aptos_framework::account;
    use std::option::{Self, Option};
    use std::string::{Self, String};

    // Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const EMARKET_NOT_FOUND: u64 = 2;
    const EMARKET_CLOSED: u64 = 3;
    const EMARKET_ALREADY_RESOLVED: u64 = 4;
    const EINVALID_BET_AMOUNT: u64 = 5;
    const EINSUFFICIENT_BALANCE: u64 = 6;
    const EINVALID_CLOSING_TIME: u64 = 7;
    const EALREADY_BET: u64 = 8;
    const ENOT_ORACLE: u64 = 9;
    const EINVALID_COIN_TYPE: u64 = 10;

    // Market status
    const STATUS_OPEN: u8 = 0;
    const STATUS_CLOSED: u8 = 1;
    const STATUS_RESOLVED: u8 = 2;

    // Bet side
    const SIDE_YES: u8 = 0;
    const SIDE_NO: u8 = 1;

    struct Market has store, key {
        id: u64,
        title: String,
        description: String,
        creator: address,
        created_at: u64,
        closes_at: u64,
        initial_pool: u64,
        min_bet: u64,
        max_bet: u64,
        status: u8,
        total_yes_bets: u64,
        total_no_bets: u64,
        result: Option<u8>,
        total_participants: u64,
    }

    struct Bet has store {
        user: address,
        amount: u64,
        side: u8,
        timestamp: u64,
    }

    struct UserBet has store {
        market_id: u64,
        amount: u64,
        side: u8,
        timestamp: u64,
    }

    struct MarketStore has key {
        markets: vector<Market>,
        next_market_id: u64,
        oracle: address,
    }

    struct UserBets has key {
        bets: vector<UserBet>,
    }

    struct MarketBets has key {
        bets: vector<Bet>,
    }

    // ETH coin type - Umi devnet'te ETH kullanıyoruz
    struct ETH has key {}

    // Events
    #[event]
    struct MarketCreatedEvent has drop, store {
        market_id: u64,
        title: String,
        creator: address,
        initial_pool: u64,
        closes_at: u64,
    }

    #[event]
    struct BetPlacedEvent has drop, store {
        market_id: u64,
        user: address,
        amount: u64,
        side: u8,
    }

    #[event]
    struct MarketResolvedEvent has drop, store {
        market_id: u64,
        result: u8,
        total_pool: u64,
    }

    #[event]
    struct RewardClaimedEvent has drop, store {
        market_id: u64,
        user: address,
        amount: u64,
    }

    // Initialize the module
    fun init_module(account: &signer) {
        let account_addr = signer::address_of(account);
        
        // Initialize market store
        move_to(account, MarketStore {
            markets: vector::empty(),
            next_market_id: 1,
            oracle: account_addr, // Creator is the oracle for now
        });

        // Initialize user bets for the creator
        move_to(account, UserBets {
            bets: vector::empty(),
        });

        // Initialize MarketBets resource for the module address
        move_to(account, MarketBets {
            bets: vector::empty(),
        });
    }

    // Create a new prediction market with ETH
    public entry fun create_market(
        creator: &signer,
        title: String,
        description: String,
        closes_at: u64,
        initial_pool: u64,
        min_bet: u64,
        max_bet: u64,
    ) acquires MarketStore {
        let creator_addr = signer::address_of(creator);
        let current_time = timestamp::now_seconds();
        
        // Validate closing time
        assert!(closes_at > current_time, EINVALID_CLOSING_TIME);
        
        // Validate bet limits
        assert!(min_bet > 0, EINVALID_BET_AMOUNT);
        assert!(max_bet >= min_bet, EINVALID_BET_AMOUNT);
        
        let market_store = borrow_global_mut<MarketStore>(@umiq);
        let market_id = market_store.next_market_id;
        
        let new_market = Market {
            id: market_id,
            title,
            description,
            creator: creator_addr,
            created_at: current_time,
            closes_at,
            initial_pool,
            min_bet,
            max_bet,
            status: STATUS_OPEN,
            total_yes_bets: 0,
            total_no_bets: 0,
            result: option::none(),
            total_participants: 0,
        };
        
        vector::push_back(&mut market_store.markets, new_market);
        market_store.next_market_id = market_store.next_market_id + 1;
        
        // Emit event
        event::emit(MarketCreatedEvent {
            market_id,
            title: string::utf8(b""), // Will be set from the market
            creator: creator_addr,
            initial_pool,
            closes_at,
        });
    }

    // Place a bet with ETH
    public entry fun place_bet_with_eth(
        user: &signer,
        market_id: u64,
        bet_amount: u64,
        side: u8,
    ) acquires MarketStore, MarketBets, UserBets {
        let user_addr = signer::address_of(user);
        let current_time = timestamp::now_seconds();
        
        let market_store = borrow_global_mut<MarketStore>(@umiq);
        let market = get_market_by_id_mut(&mut market_store.markets, market_id);
        
        // Validate market exists and is open
        assert!(market.status == STATUS_OPEN, EMARKET_CLOSED);
        assert!(current_time < market.closes_at, EMARKET_CLOSED);
        
        // Validate bet amount
        assert!(bet_amount >= market.min_bet, EINVALID_BET_AMOUNT);
        assert!(bet_amount <= market.max_bet, EINVALID_BET_AMOUNT);
        assert!(side == SIDE_YES || side == SIDE_NO, EINVALID_BET_AMOUNT);
        
        // Check user's ETH balance
        let user_eth_balance = coin::balance<ETH>(user_addr);
        assert!(user_eth_balance >= bet_amount, EINSUFFICIENT_BALANCE);
        
        // Transfer ETH from user to contract (for now, just check balance)
        // In a full implementation, you'd transfer ETH to contract
        // let user_eth_coin = coin::withdraw<ETH>(user, bet_amount);
        
        // MarketBets resource must exist at @umiq
        assert!(exists<MarketBets>(@umiq), EMARKET_NOT_FOUND);
        let market_bets = borrow_global_mut<MarketBets>(@umiq);
        let user_bet = Bet {
            user: user_addr,
            amount: bet_amount,
            side,
            timestamp: current_time,
        };
        vector::push_back(&mut market_bets.bets, user_bet);
        
        // Update market totals
        if (side == SIDE_YES) {
            market.total_yes_bets = market.total_yes_bets + bet_amount;
        } else {
            market.total_no_bets = market.total_no_bets + bet_amount;
        };
        market.total_participants = market.total_participants + 1;
        
        // Update user bets
        if (!exists<UserBets>(user_addr)) {
            move_to(user, UserBets {
                bets: vector::empty(),
            });
        };
        
        let user_bets = borrow_global_mut<UserBets>(user_addr);
        let user_bet_record = UserBet {
            market_id,
            amount: bet_amount,
            side,
            timestamp: current_time,
        };
        vector::push_back(&mut user_bets.bets, user_bet_record);
        
        // Emit event
        event::emit(BetPlacedEvent {
            market_id,
            user: user_addr,
            amount: bet_amount,
            side,
        });
    }

    // Resolve a market (oracle only) and distribute rewards
    public entry fun resolve_market_and_distribute(
        oracle: &signer,
        market_id: u64,
        result: u8,
    ) acquires MarketStore {
        let oracle_addr = signer::address_of(oracle);
        let market_store = borrow_global_mut<MarketStore>(@umiq);
        let market = get_market_by_id_mut(&mut market_store.markets, market_id);
        
        // Validate oracle
        assert!(oracle_addr == market_store.oracle, ENOT_ORACLE);
        
        // Validate market is closed and not resolved
        assert!(market.status == STATUS_CLOSED, EMARKET_ALREADY_RESOLVED);
        assert!(result == SIDE_YES || result == SIDE_NO, EINVALID_BET_AMOUNT);
        
        market.status = STATUS_RESOLVED;
        market.result = option::some(result);
        
        let total_pool = market.initial_pool + market.total_yes_bets + market.total_no_bets;
        
        // Emit event
        event::emit(MarketResolvedEvent {
            market_id,
            result,
            total_pool,
        });
    }

    // Close a market when time expires
    public entry fun close_market(
        market_id: u64,
    ) acquires MarketStore {
        let current_time = timestamp::now_seconds();
        let market_store = borrow_global_mut<MarketStore>(@umiq);
        let market = get_market_by_id_mut(&mut market_store.markets, market_id);
        
        // Check if market should be closed
        if (current_time >= market.closes_at && market.status == STATUS_OPEN) {
            market.status = STATUS_CLOSED;
        };
    }

    // Claim rewards for winning bets
    public entry fun claim_rewards(
        user: &signer,
        market_id: u64,
    ) acquires MarketStore {
        let user_addr = signer::address_of(user);
        let market_store = borrow_global<MarketStore>(@umiq);
        let market = get_market_by_id(&market_store.markets, market_id);
        
        // Validate market is resolved
        assert!(market.status == STATUS_RESOLVED, EMARKET_ALREADY_RESOLVED);
        assert!(option::is_some(&market.result), EMARKET_ALREADY_RESOLVED);
        
        let winning_side = option::borrow(&market.result);
        
        // Calculate user's winning amount (simplified for now)
        let total_winnings = 0;
        // In a full implementation, you'd calculate actual winnings based on user bets
        
        // Transfer winnings to user
        if (total_winnings > 0) {
            // For now, just emit the event - actual ETH transfer will be handled by oracle
            // In a full implementation, you'd need proper signer capabilities
            event::emit(RewardClaimedEvent {
                market_id,
                user: user_addr,
                amount: total_winnings,
            });
        };
    }

    // Get market by ID
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

    // Get user bets for a specific market
    fun get_user_bets_for_market(user_addr: address, market_id: u64): vector<UserBet> acquires UserBets {
        if (exists<UserBets>(user_addr)) {
            let user_bets = borrow_global<UserBets>(user_addr);
            let market_bets = vector::empty<UserBet>();
            
            let i = 0;
            let len = vector::length(&user_bets.bets);
            while (i < len) {
                let bet = vector::borrow(&user_bets.bets, i);
                if (bet.market_id == market_id) {
                    // Create a new UserBet with the same data
                    let new_bet = UserBet {
                        market_id: bet.market_id,
                        amount: bet.amount,
                        side: bet.side,
                        timestamp: bet.timestamp,
                    };
                    vector::push_back(&mut market_bets, new_bet);
                };
                i = i + 1;
            };
            market_bets
        } else {
            vector::empty<UserBet>()
        }
    }

    // View functions
    #[view]
    public fun get_oracle(): address acquires MarketStore {
        let market_store = borrow_global<MarketStore>(@umiq);
        market_store.oracle
    }

    #[view]
    public fun get_market_count(): u64 acquires MarketStore {
        let market_store = borrow_global<MarketStore>(@umiq);
        vector::length(&market_store.markets)
    }

    #[view]
    public fun get_user_eth_balance(user_addr: address): u64 {
        coin::balance<ETH>(user_addr)
    }
} 