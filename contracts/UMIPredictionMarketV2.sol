// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UMIPredictionMarketV2 {
    uint256 public marketCount = 0;
    
    struct Market {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 closingTime;
        uint256 totalYesBets;
        uint256 totalNoBets;
        uint256 minBet;
        uint256 maxBet;
        bool isResolved;
        bool outcome;
        bool isClosed;
        uint256 totalBets;
        uint256 totalPool;
    }
    
    struct Bet {
        address user;
        uint256 amount;
        bool prediction;
        uint256 timestamp;
        bool claimed;
    }
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => Bet[]) public marketBets;
    mapping(address => uint256[]) public userBets;
    mapping(address => uint256) public userBalances;
    
    event MarketCreated(uint256 indexed marketId, address indexed creator, string title, uint256 closingTime);
    event BetPlaced(uint256 indexed marketId, address indexed user, uint256 amount, bool prediction);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    
    function createMarket(
        string memory title,
        string memory description,
        uint256 closingTime,
        uint256 minBet,
        uint256 maxBet
    ) external {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(closingTime > block.timestamp + 1 hours, "Closing time must be at least 1 hour in the future");
        require(minBet >= 0.001 ether, "Minimum bet must be at least 0.001 ETH");
        require(maxBet >= minBet, "Maximum bet must be greater than or equal to minimum bet");
        require(maxBet <= 10 ether, "Maximum bet cannot exceed 10 ETH");

        marketCount++;
        uint256 marketId = marketCount;

        markets[marketId] = Market({
            id: marketId,
            creator: msg.sender,
            title: title,
            description: description,
            closingTime: closingTime,
            totalYesBets: 0,
            totalNoBets: 0,
            minBet: minBet,
            maxBet: maxBet,
            isResolved: false,
            outcome: false,
            isClosed: false,
            totalBets: 0,
            totalPool: 0
        });

        emit MarketCreated(marketId, msg.sender, title, closingTime);
    }

    function placeBet(uint256 marketId, bool prediction) external payable {
        require(markets[marketId].creator != address(0), "Market does not exist");
        require(!markets[marketId].isClosed, "Market is closed");
        require(!markets[marketId].isResolved, "Market is already resolved");
        require(block.timestamp < markets[marketId].closingTime, "Market is closed for betting");
        require(msg.value >= markets[marketId].minBet, "Bet amount below minimum");
        require(msg.value <= markets[marketId].maxBet, "Bet amount above maximum");
        require(msg.sender != markets[marketId].creator, "Market creator cannot bet on their own market");

        Market storage market = markets[marketId];

        if (prediction) {
            market.totalYesBets += msg.value;
        } else {
            market.totalNoBets += msg.value;
        }

        market.totalBets += 1;
        market.totalPool += msg.value;

        Bet memory newBet = Bet({
            user: msg.sender,
            amount: msg.value,
            prediction: prediction,
            timestamp: block.timestamp,
            claimed: false
        });

        marketBets[marketId].push(newBet);
        userBets[msg.sender].push(marketId);

        emit BetPlaced(marketId, msg.sender, msg.value, prediction);
    }

    function resolveMarket(uint256 marketId, bool outcome) external {
        require(markets[marketId].creator != address(0), "Market does not exist");
        require(!markets[marketId].isResolved, "Market is already resolved");
        require(block.timestamp >= markets[marketId].closingTime, "Market not yet closed");
        require(markets[marketId].totalBets > 0, "No bets placed on market");
        require(msg.sender == markets[marketId].creator, "Only creator can resolve");

        markets[marketId].isResolved = true;
        markets[marketId].outcome = outcome;

        emit MarketResolved(marketId, outcome);
    }

    function claimReward(uint256 marketId) external {
        require(markets[marketId].creator != address(0), "Market does not exist");
        require(markets[marketId].isResolved, "Market not resolved");
        require(!markets[marketId].isClosed, "Market is closed");

        uint256 totalReward = 0;
        Bet[] storage bets = marketBets[marketId];

        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].user == msg.sender && bets[i].prediction == markets[marketId].outcome && !bets[i].claimed) {
                uint256 userBetAmount = bets[i].amount;
                uint256 totalWinningBets = markets[marketId].outcome ? markets[marketId].totalYesBets : markets[marketId].totalNoBets;
                
                if (totalWinningBets > 0) {
                    uint256 reward = (userBetAmount * markets[marketId].totalPool) / totalWinningBets;
                    totalReward += reward;
                }
                
                bets[i].claimed = true;
            }
        }

        require(totalReward > 0, "No rewards to claim");

        userBalances[msg.sender] += totalReward;
        emit RewardClaimed(marketId, msg.sender, totalReward);
    }

    function withdrawBalance() external {
        uint256 balance = userBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");

        userBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
    }

    function closeMarket(uint256 marketId) external {
        require(markets[marketId].creator != address(0), "Market does not exist");
        require(!markets[marketId].isClosed, "Market is already closed");
        require(msg.sender == markets[marketId].creator, "Only creator can close");

        markets[marketId].isClosed = true;
    }

    // View functions
    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    function getMarketBets(uint256 marketId) external view returns (Bet[] memory) {
        return marketBets[marketId];
    }

    function getUserBets(address user) external view returns (uint256[] memory) {
        return userBets[user];
    }

    function getUserBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }

    function getMarketCount() external view returns (uint256) {
        return marketCount;
    }

    function getMarketStats(uint256 marketId) external view returns (
        uint256 totalYesBets,
        uint256 totalNoBets,
        uint256 totalBets,
        uint256 totalPool,
        bool isResolved,
        bool outcome
    ) {
        Market storage market = markets[marketId];
        return (
            market.totalYesBets,
            market.totalNoBets,
            market.totalBets,
            market.totalPool,
            market.isResolved,
            market.outcome
        );
    }
} 