const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PredictionMarket to Umi Devnet...");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance === 0n) {
    console.log("❌ No balance to deploy. Please fund the account first.");
    return;
  }
  
  // Get the contract factory
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  console.log("Contract factory created");
  
  // Deploy the contract
  console.log("Deploying contract...");
  const predictionMarket = await PredictionMarket.deploy();
  
  console.log("Transaction hash:", predictionMarket.deploymentTransaction().hash);
  
  // Wait for deployment to finish
  await predictionMarket.waitForDeployment();
  
  const address = await predictionMarket.getAddress();
  
  console.log("✅ PredictionMarket deployed to:", address);
  console.log("🌐 Network: Umi Devnet");
  console.log("🔗 Explorer: https://devnet.explorer.uminetwork.com/address/" + address);
  
  console.log("\n📋 Contract Address for Frontend:");
  console.log("NEXT_PUBLIC_CONTRACT_ADDRESS=" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 