// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract PredictionMarket {
    // Events
    event MarketCreated(uint256 marketId, string title);
    event BetPlaced(uint256 marketId, address bettor, bool prediction);

    // Market structure
    struct Market {
        uint256 id;
        string title;
        address creator;
        uint256 closingTime;
        bool resolved;
        bool outcome;
    }

    // State variables
    uint256 public nextMarketId;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => bool)) public bets;
    address public treasuryWallet;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _treasuryWallet) {
        treasuryWallet = _treasuryWallet;
        owner = msg.sender;
    }

    // Create a new prediction market
    function createMarket(string memory title, uint256 closingTime) external payable {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(closingTime > block.timestamp, "Closing time must be in the future");
        require(msg.value >= 0.01 ether, "Initial pool must be at least 0.01 ETH");

        uint256 marketId = nextMarketId++;
        markets[marketId] = Market({
            id: marketId,
            title: title,
            creator: msg.sender,
            closingTime: closingTime,
            resolved: false,
            outcome: false
        });

        emit MarketCreated(marketId, title);
    }

    // Place a bet on a market
    function placeBet(uint256 marketId, bool prediction) external payable {
        require(marketId < nextMarketId, "Market does not exist");
        require(block.timestamp < markets[marketId].closingTime, "Market is closed");
        require(msg.value >= 0.001 ether, "Bet must be at least 0.001 ETH");
        require(!bets[marketId][msg.sender], "Already placed a bet");

        bets[marketId][msg.sender] = prediction;
        emit BetPlaced(marketId, msg.sender, prediction);
    }

    // Resolve market (only owner)
    function resolveMarket(uint256 marketId, bool outcome) external onlyOwner {
        require(marketId < nextMarketId, "Market does not exist");
        require(!markets[marketId].resolved, "Market already resolved");
        
        markets[marketId].resolved = true;
        markets[marketId].outcome = outcome;
    }

    // Get market details
    function getMarket(uint256 marketId) external view returns (
        uint256 id,
        string memory title,
        address creator,
        uint256 closingTime,
        bool resolved,
        bool outcome
    ) {
        Market storage market = markets[marketId];
        return (
            market.id,
            market.title,
            market.creator,
            market.closingTime,
            market.resolved,
            market.outcome
        );
    }

    // Check if user has bet
    function hasUserBet(uint256 marketId, address user) external view returns (bool) {
        return bets[marketId][user];
    }

    // Get contract balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Withdraw to treasury (only owner)
    function withdrawToTreasury() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(treasuryWallet).call{value: balance}("");
        require(success, "Transfer failed");
    }

    // Receive ETH
    receive() external payable {}
} 