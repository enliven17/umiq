const { ethers } = require('hardhat');
const { AccountAddress, EntryFunction, FixedBytes, parseTypeTag } = require('@aptos-labs/ts-sdk');
const { TransactionPayloadEntryFunction, TypeTagSigner } = require('@aptos-labs/ts-sdk');

async function main() {
  const contractName = 'umiq';
  const [deployer] = await ethers.getSigners();
  const moduleAddress = deployer.address.replace('0x', '0x000000000000000000000000');

  console.log('Deploying UMIq Prediction Market contract...');
  console.log('Deployer address:', deployer.address);
  console.log('Module address:', moduleAddress);

  // Deploy the Move contract using Hardhat
  const UMIqContract = await ethers.getContractFactory(contractName);
  const umiqContract = await UMIqContract.deploy();
  await umiqContract.waitForDeployment();
  
  console.log(`UMIq Prediction Market deployed to: ${deployer.address}::${contractName}`);

  // Initialize the contract
  const address = AccountAddress.fromString(moduleAddress);
  const addressBytes = [33, 0, ...address.toUint8Array()];
  const signer = new FixedBytes(new Uint8Array(addressBytes));

  const entryFunction = EntryFunction.build(
    `${moduleAddress}::eth_prediction_market`,
    'init_module',
    [], // type arguments
    [signer] // arguments
  );
  
  const transactionPayload = new TransactionPayloadEntryFunction(entryFunction);
  const payload = transactionPayload.bcsToHex();
  
  const request = {
    to: deployer.address,
    data: payload.toString(),
  };
  
  console.log('Initializing contract...');
  const tx = await deployer.sendTransaction(request);
  await tx.wait();
  console.log('Contract initialized successfully!');
  
  console.log('\n=== Deployment Summary ===');
  console.log('Contract Address:', deployer.address);
  console.log('Module Name:', `${moduleAddress}::eth_prediction_market`);
  console.log('Transaction Hash:', tx.hash);
  console.log('Network: Umi Devnet');
  console.log('Explorer: https://devnet.explorer.moved.network');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Deployment failed:', err);
    process.exit(1);
  }); 