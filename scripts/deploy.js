const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PredictionMarket to Umi Devnet...");
  
  // Get the contract factory
  const PredictionMarket = await hre.ethers.getContractFactory("PredictionMarket");
  
  // Deploy the contract
  const predictionMarket = await PredictionMarket.deploy();
  
  // Wait for deployment to finish
  await predictionMarket.waitForDeployment();
  
  const address = await predictionMarket.getAddress();
  
  console.log("✅ PredictionMarket deployed to:", address);
  console.log("🌐 Network: Umi Devnet");
  console.log("🔗 Explorer: https://devnet.explorer.uminetwork.com/address/" + address);
  
  // Verify the contract
  console.log("🔍 Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    console.log("⚠️ Verification failed:", error.message);
  }
  
  console.log("\n📋 Contract Address for Frontend:");
  console.log("NEXT_PUBLIC_CONTRACT_ADDRESS=" + address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 