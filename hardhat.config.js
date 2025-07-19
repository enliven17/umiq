require("@nomicfoundation/hardhat-toolbox");
// require("@moved/hardhat-plugin");

module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "devnet",
  networks: {
    devnet: {
      url: "https://devnet.uminetwork.com",
      accounts: ["2a975a6e86c98d3e96927ba685f2e45a7df6363596e30df574c7901f2e2e6cc9"]
    }
  }
}; 