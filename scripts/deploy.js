const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy LuxiaToken
  console.log("\n🚀 Deploying LuxiaToken...");
  const LuxiaToken = await ethers.getContractFactory("LuxiaToken");
  const luxiaToken = await LuxiaToken.deploy(deployer.address);
  await luxiaToken.waitForDeployment();

  const luxiaAddress = await luxiaToken.getAddress();
  console.log("✅ LuxiaToken deployed to:", luxiaAddress);

  // Deploy NotoriusToken
  console.log("\n🚀 Deploying NotoriusToken...");
  const NotoriusToken = await ethers.getContractFactory("NotoriusToken");
  const notoriusToken = await NotoriusToken.deploy(deployer.address);
  await notoriusToken.waitForDeployment();

  const notoriusAddress = await notoriusToken.getAddress();
  console.log("✅ NotoriusToken deployed to:", notoriusAddress);

  // Display token information
  console.log("\n📊 Token Information:");
  
  const luxiaInfo = await luxiaToken.getTokenInfo();
  console.log("\n🌟 LUXIA TOKEN:");
  console.log(`  Name: ${luxiaInfo[0]}`);
  console.log(`  Symbol: ${luxiaInfo[1]}`);
  console.log(`  Decimals: ${luxiaInfo[2]}`);
  console.log(`  Total Supply: ${ethers.formatEther(luxiaInfo[3])} LUXIA`);
  console.log(`  Max Supply: ${ethers.formatEther(luxiaInfo[4])} LUXIA`);
  console.log(`  Contract Address: ${luxiaAddress}`);

  const notoriusInfo = await notoriusToken.getTokenInfo();
  console.log("\n🔥 NOTORIOUS TOKEN:");
  console.log(`  Name: ${notoriusInfo[0]}`);
  console.log(`  Symbol: ${notoriusInfo[1]}`);
  console.log(`  Decimals: ${notoriusInfo[2]}`);
  console.log(`  Total Supply: ${ethers.formatEther(notoriusInfo[3])} NOTORIOUS`);
  console.log(`  Max Supply: ${ethers.formatEther(notoriusInfo[4])} NOTORIOUS`);
  console.log(`  Transfer Fee: ${notoriusInfo[5] / 100}%`);
  console.log(`  Fee Collector: ${notoriusInfo[6]}`);
  console.log(`  Paused: ${notoriusInfo[7]}`);
  console.log(`  Contract Address: ${notoriusAddress}`);

  // Save deployment info
  const deploymentInfo = {
    network: "localhost",
    deployer: deployer.address,
    contracts: {
      LuxiaToken: {
        address: luxiaAddress,
        name: luxiaInfo[0],
        symbol: luxiaInfo[1],
        totalSupply: ethers.formatEther(luxiaInfo[3]),
        maxSupply: ethers.formatEther(luxiaInfo[4])
      },
      NotoriusToken: {
        address: notoriusAddress,
        name: notoriusInfo[0],
        symbol: notoriusInfo[1],
        totalSupply: ethers.formatEther(notoriusInfo[3]),
        maxSupply: ethers.formatEther(notoriusInfo[4]),
        transferFee: `${notoriusInfo[5] / 100}%`,
        feeCollector: notoriusInfo[6]
      }
    }
  };

  console.log("\n💾 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return { luxiaToken, notoriusToken, deploymentInfo };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };