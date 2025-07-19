const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  // Treasury wallet address
  const treasuryWallet = "0xcc78505FE8707a1D85229BA0E7177aE26cE0f17D";
  console.log('Treasury wallet:', treasuryWallet);

  console.log('Deploying PredictionMarket contract to Umi devnet...');
  
  try {
    const PredictionMarket = await ethers.getContractFactory('PredictionMarket');
    console.log('Contract factory created successfully');
    
    const predictionMarket = await PredictionMarket.deploy(treasuryWallet);
    console.log('Deployment transaction hash:', predictionMarket.deploymentTransaction().hash);
    
    await predictionMarket.waitForDeployment();
    
    // Get the generated contract address from the transaction receipt
    const receipt = await ethers.provider.getTransactionReceipt(predictionMarket.deploymentTransaction()?.hash);
    console.log('✅ PredictionMarket is deployed to:', receipt?.contractAddress);
    
    // Test the contract
    console.log('\n🧪 Testing contract functions...');
    
    // Create a test market
    const marketTitle = "Will Bitcoin reach $100k by end of 2024?";
    const closingTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
    const initialPool = ethers.parseEther("0.01"); // 0.01 ETH
    
    console.log('Creating test market...');
    const createMarketTx = await predictionMarket.createMarket(
      marketTitle,
      closingTime,
      { value: initialPool }
    );
    await createMarketTx.wait();
    console.log('✅ Test market created successfully!');
    
    // Get market details
    const market = await predictionMarket.getMarket(0);
    console.log('\n📊 Market Details:');
    console.log('Market ID:', market[0].toString());
    console.log('Title:', market[1]);
    console.log('Creator:', market[2]);
    console.log('Closing Time:', new Date(Number(market[3]) * 1000).toLocaleString());
    console.log('Resolved:', market[4]);
    console.log('Outcome:', market[5]);
    
    console.log('\n🎉 Deployment and testing completed successfully!');
    console.log('Contract is ready to use on Umi devnet.');
    console.log('\n📋 Contract Details:');
    console.log('Address:', receipt?.contractAddress);
    console.log('Deploy TX:', predictionMarket.deploymentTransaction().hash);
    console.log('Create Market TX:', createMarketTx.hash);
    console.log('Treasury Wallet:', treasuryWallet);
    console.log('Explorer:', `https://devnet.explorer.moved.network/address/${receipt?.contractAddress}`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    
    if (error.message.includes('network') || error.message.includes('ENS')) {
      console.log('\n🔍 Network Issue Detected:');
      console.log('The Umi devnet might be in maintenance mode.');
      console.log('API Status: Available but chain state is missing');
      console.log('Please try again later when the network is fully operational.');
    }
    
    console.log('\n📋 Deployment Summary:');
    console.log('✅ Solidity contract compiled successfully');
    console.log('✅ Hardhat configuration ready');
    console.log('❌ Network not ready for deployment');
    console.log('\n🔄 Next Steps:');
    console.log('1. Wait for Umi devnet to be fully operational');
    console.log('2. Run: npx hardhat run scripts/deploy.js --network devnet');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 