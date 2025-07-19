require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: "devnet",
  networks: {
    devnet: {
      url: "https://devnet.uminetwork.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42069,
      gasPrice: 1000000000, // 1 gwei
      gas: 8000000,
      timeout: 60000,
      verify: {
        etherscan: {
          apiUrl: "https://devnet.explorer.uminetwork.com/api"
        }
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      devnet: "dummy" // Umi devnet doesn't need real API key
    },
    customChains: [
      {
        network: "devnet",
        chainId: 42069,
        urls: {
          apiURL: "https://devnet.explorer.uminetwork.com/api",
          browserURL: "https://devnet.explorer.uminetwork.com"
        }
      }
    ]
  }
}; 