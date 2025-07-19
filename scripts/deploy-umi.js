const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying UMIPredictionMarket to Umi Devnet...");
  
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
  const UMIPredictionMarketV3 = await hre.ethers.getContractFactory("UMIPredictionMarketV3");
  console.log("Contract factory created");
  
  // Deploy the contract with explicit gas settings
  console.log("Deploying contract...");
  
  const predictionMarket = await UMIPredictionMarketV3.deploy({
    gasLimit: 2000000,
    gasPrice: hre.ethers.parseUnits("0.5", "gwei")
  });
  
  console.log("Transaction hash:", predictionMarket.deploymentTransaction().hash);
  console.log("Waiting for deployment confirmation...");
  
  // Wait for deployment to finish with timeout
  try {
    await Promise.race([
      predictionMarket.waitForDeployment(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Deployment timeout')), 30000)
      )
    ]);
  } catch (error) {
    if (error.message === 'Deployment timeout') {
      console.log("⚠️ Deployment timeout - checking transaction status...");
      // Check if transaction was successful
      const receipt = await hre.ethers.provider.getTransactionReceipt(predictionMarket.deploymentTransaction().hash);
      if (receipt && receipt.status === 1) {
        console.log("✅ Transaction confirmed but waiting for contract deployment...");
      } else {
        console.log("❌ Transaction failed or pending");
        return;
      }
    } else {
      throw error;
    }
  }
  
  const address = await predictionMarket.getAddress();
  
  console.log("✅ UMIPredictionMarketV3 deployed to:", address);
  console.log("🌐 Network: Umi Devnet");
  console.log("🔗 Explorer: https://devnet.explorer.uminetwork.com/address/" + address);
  
  // Save deployment info
  const deploymentInfo = {
    network: "devnet",
    contract: "UMIPredictionMarketV3",
    address: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    explorer: `https://devnet.explorer.uminetwork.com/address/${address}`,
    rpcUrl: "https://devnet.uminetwork.com",
    chainId: 42069
  };
  
  console.log("\n📋 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n📋 Contract Address for Frontend:");
  console.log("NEXT_PUBLIC_CONTRACT_ADDRESS=" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 