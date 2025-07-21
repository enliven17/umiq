import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@moved/hardhat-plugin";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
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
      accounts: [process.env.PRIVATE_KEY?.startsWith("0x") ? process.env.PRIVATE_KEY! : "0x" + process.env.PRIVATE_KEY!]
    }
  }
};

export default config; 