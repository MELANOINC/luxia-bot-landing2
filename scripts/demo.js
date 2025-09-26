#!/usr/bin/env node
/**
 * Demo script to showcase LUXIA and NOTORIOUS token functionality
 * Run this after deploying contracts and starting the server
 */

const { ethers } = require('ethers');

const SERVER_URL = 'http://localhost:5678';

async function makeRequest(method, url, data = null) {
  const fetch = (await import('node-fetch')).default;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${SERVER_URL}${url}`, options);
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  } else {
    return await response.text();
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  console.log('🚀 LUXIA & NOTORIOUS Token Demo');
  console.log('=' .repeat(50));
  
  try {
    // 1. Check server status
    console.log('\n1. Checking server status...');
    const serverStatus = await makeRequest('GET', '/');
    console.log('✅ Server:', serverStatus);
    
    // 2. Check Web3 status
    console.log('\n2. Checking Web3 status...');
    const web3Status = await makeRequest('GET', '/web3/status');
    console.log('📊 Web3 Status:', web3Status);
    
    if (!web3Status.ok) {
      console.log('\n⚠️ Web3 not initialized. To use smart contracts:');
      console.log('1. Start a local Hardhat node: npx hardhat node');
      console.log('2. Deploy contracts: npm run deploy');
      console.log('3. Initialize Web3: POST /web3/initialize');
      console.log('4. Load contracts: POST /web3/load-contracts');
      return;
    }
    
    // 3. Get token information
    console.log('\n3. Getting token information...');
    
    try {
      const luxiaInfo = await makeRequest('GET', '/tokens/luxia/info');
      console.log('🌟 LUXIA Token:', luxiaInfo.token);
    } catch (error) {
      console.log('❌ LUXIA token not loaded:', error.message);
    }
    
    try {
      const notoriusInfo = await makeRequest('GET', '/tokens/notorious/info');
      console.log('🔥 NOTORIOUS Token:', notoriusInfo.token);
    } catch (error) {
      console.log('❌ NOTORIOUS token not loaded:', error.message);
    }
    
    // 4. Demo contract interactions (if contracts are loaded)
    if (web3Status.contracts && web3Status.contracts.luxia) {
      console.log('\n4. Demo contract interactions...');
      
      // Get signer address
      const signerAddress = web3Status.signer;
      
      // Check balances
      console.log(`\n📈 Checking balances for ${signerAddress}:`);
      
      const luxiaBalance = await makeRequest('GET', `/tokens/luxia/balance/${signerAddress}`);
      console.log(`LUXIA Balance: ${luxiaBalance.balance} LUXIA`);
      
      const notoriusBalance = await makeRequest('GET', `/tokens/notorious/balance/${signerAddress}`);
      console.log(`NOTORIOUS Balance: ${notoriusBalance.balance} NOTORIOUS`);
      
      // Demo transfer (small amount)
      console.log('\n💸 Demo transfer (0.1 tokens to self):');
      
      try {
        const luxiaTransfer = await makeRequest('POST', '/tokens/luxia/transfer', {
          to: signerAddress,
          amount: 0.1
        });
        console.log('✅ LUXIA transfer:', luxiaTransfer.transaction.txHash);
      } catch (error) {
        console.log('❌ LUXIA transfer failed:', error.message);
      }
      
      try {
        const notoriusTransfer = await makeRequest('POST', '/tokens/notorious/transfer', {
          to: signerAddress,
          amount: 0.1
        });
        console.log('✅ NOTORIOUS transfer (with fee):', notoriusTransfer.transaction.txHash);
      } catch (error) {
        console.log('❌ NOTORIOUS transfer failed:', error.message);
      }
    }
    
    console.log('\n🎉 Demo completed successfully!');
    console.log('\n📚 Available endpoints:');
    console.log('- GET /web3/status');
    console.log('- GET /tokens/luxia/info');
    console.log('- GET /tokens/notorious/info');
    console.log('- GET /tokens/luxia/balance/:address');
    console.log('- GET /tokens/notorious/balance/:address');
    console.log('- POST /tokens/luxia/transfer');
    console.log('- POST /tokens/notorious/transfer');
    console.log('- POST /tokens/luxia/mint');
    console.log('- POST /tokens/notorious/set-fee');
    console.log('- POST /tokens/notorious/blacklist');
    console.log('- POST /tokens/notorious/pause');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.log('\n🔧 Make sure the server is running: npm start');
  }
}

// Run demo
if (require.main === module) {
  demo().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { demo };