// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UMIPredictionMarketV3 {
    uint256 public marketCount;
    
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
    }
    
    struct Bet {
        address user;
        uint256 amount;
        bool prediction;
        bool claimed;
    }
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => Bet[]) public marketBets;
    mapping(address => uint256) public userBalances;
    
    event MarketCreated(uint256 indexed marketId, address indexed creator, string title);
    event BetPlaced(uint256 indexed marketId, address indexed user, uint256 amount, bool prediction);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event RewardClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    
    function createMarket(
        string calldata title,
        string calldata description,
        uint256 closingTime,
        uint256 minBet,
        uint256 maxBet
    ) external {
        require(bytes(title).length > 0, "Title required");
        require(bytes(description).length > 0, "Description required");
        require(closingTime > block.timestamp + 1 hours, "Min 1 hour future");
        require(minBet >= 0.001 ether, "Min bet 0.001 ETH");
        require(maxBet >= minBet, "Max >= min bet");
        require(maxBet <= 10 ether, "Max bet 10 ETH");

        marketCount++;
        
        markets[marketCount] = Market({
            id: marketCount,
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
            isClosed: false
        });

        emit MarketCreated(marketCount, msg.sender, title);
    }

    function placeBet(uint256 marketId, bool prediction) external payable {
        Market storage market = markets[marketId];
        require(market.creator != address(0), "Market not found");
        require(!market.isClosed, "Market closed");
        require(!market.isResolved, "Market resolved");
        require(block.timestamp < market.closingTime, "Betting closed");
        require(msg.value >= market.minBet, "Below min bet");
        require(msg.value <= market.maxBet, "Above max bet");
        require(msg.sender != market.creator, "Creator cannot bet");

        if (prediction) {
            market.totalYesBets += msg.value;
        } else {
            market.totalNoBets += msg.value;
        }

        marketBets[marketId].push(Bet({
            user: msg.sender,
            amount: msg.value,
            prediction: prediction,
            claimed: false
        }));

        emit BetPlaced(marketId, msg.sender, msg.value, prediction);
    }

    function resolveMarket(uint256 marketId, bool outcome) external {
        Market storage market = markets[marketId];
        require(market.creator != address(0), "Market not found");
        require(!market.isResolved, "Already resolved");
        require(block.timestamp >= market.closingTime, "Not yet closed");
        require(msg.sender == market.creator, "Only creator");

        market.isResolved = true;
        market.outcome = outcome;

        emit MarketResolved(marketId, outcome);
    }

    function claimReward(uint256 marketId) external {
        Market storage market = markets[marketId];
        require(market.creator != address(0), "Market not found");
        require(market.isResolved, "Not resolved");
        require(!market.isClosed, "Market closed");

        uint256 totalReward = 0;
        Bet[] storage bets = marketBets[marketId];
        uint256 totalPool = market.totalYesBets + market.totalNoBets;
        uint256 totalWinningBets = market.outcome ? market.totalYesBets : market.totalNoBets;

        for (uint256 i = 0; i < bets.length; i++) {
            if (bets[i].user == msg.sender && 
                bets[i].prediction == market.outcome && 
                !bets[i].claimed) {
                
                uint256 reward = (bets[i].amount * totalPool) / totalWinningBets;
                totalReward += reward;
                bets[i].claimed = true;
            }
        }

        require(totalReward > 0, "No rewards");

        userBalances[msg.sender] += totalReward;
        emit RewardClaimed(marketId, msg.sender, totalReward);
    }

    function withdrawBalance() external {
        uint256 balance = userBalances[msg.sender];
        require(balance > 0, "No balance");

        userBalances[msg.sender] = 0;
        payable(msg.sender).transfer(balance);
    }

    function closeMarket(uint256 marketId) external {
        Market storage market = markets[marketId];
        require(market.creator != address(0), "Market not found");
        require(!market.isClosed, "Already closed");
        require(msg.sender == market.creator, "Only creator");

        market.isClosed = true;
    }

    // View functions
    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    function getMarketBets(uint256 marketId) external view returns (Bet[] memory) {
        return marketBets[marketId];
    }

    function getUserBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }

    function getMarketStats(uint256 marketId) external view returns (
        uint256 totalYesBets,
        uint256 totalNoBets,
        uint256 totalBets,
        bool isResolved,
        bool outcome
    ) {
        Market storage market = markets[marketId];
        return (
            market.totalYesBets,
            market.totalNoBets,
            marketBets[marketId].length,
            market.isResolved,
            market.outcome
        );
    }
} 