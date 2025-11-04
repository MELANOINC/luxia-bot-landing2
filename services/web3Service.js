const { ethers } = require('ethers');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.luxiaToken = null;
    this.notoriusToken = null;
    this.contractAddresses = {
      luxia: null,
      notorious: null
    };
    // Cache for token info
    this.cache = new Map();
    this.CACHE_TTL = 30000; // 30 seconds cache
  }

  /**
   * Get cached value or execute function and cache result
   */
  async getOrCache(key, fn, ttl = this.CACHE_TTL) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.value;
    }
    
    const value = await fn();
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
    
    return value;
  }

  /**
   * Clear cache (useful for testing or after state changes)
   */
  clearCache() {
    this.cache.clear();
  }

  async initialize(providerUrl = 'http://localhost:8545') {
    try {
      // Initialize provider with keepalive settings
      this.provider = new ethers.JsonRpcProvider(providerUrl, undefined, {
        staticNetwork: true, // Optimize for static networks
      });
      
      // For demo purposes, we'll use a default private key
      // In production, this should be loaded securely
      const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
      this.signer = new ethers.Wallet(privateKey, this.provider);

      // Test connection
      await this.provider.getBlockNumber();

      console.log('✅ Web3Service initialized');
      console.log('Provider:', providerUrl);
      console.log('Signer address:', this.signer.address);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Web3Service:', error.message);
      return false;
    }
  }

  async loadContracts(luxiaAddress, notoriusAddress) {
    try {
      if (!this.signer) {
        throw new Error('Web3Service not initialized');
      }

      // Load contract ABIs
      const luxiaArtifact = await this.loadArtifact('LuxiaToken');
      const notoriusArtifact = await this.loadArtifact('NotoriusToken');

      if (!luxiaArtifact || !notoriusArtifact) {
        throw new Error('Contract artifacts not found. Please compile contracts first.');
      }

      // Create contract instances
      this.luxiaToken = new ethers.Contract(luxiaAddress, luxiaArtifact.abi, this.signer);
      this.notoriusToken = new ethers.Contract(notoriusAddress, notoriusArtifact.abi, this.signer);

      this.contractAddresses.luxia = luxiaAddress;
      this.contractAddresses.notorious = notoriusAddress;

      console.log('✅ Contracts loaded successfully');
      console.log('LuxiaToken:', luxiaAddress);
      console.log('NotoriusToken:', notoriusAddress);

      return true;
    } catch (error) {
      console.error('❌ Failed to load contracts:', error.message);
      return false;
    }
  }

  async loadArtifact(contractName) {
    try {
      const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
      if (fsSync.existsSync(artifactPath)) {
        const data = await fs.readFile(artifactPath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error(`Error loading artifact for ${contractName}:`, error.message);
      return null;
    }
  }

  // LUXIA Token Methods
  async getLuxiaTokenInfo() {
    try {
      if (!this.luxiaToken) throw new Error('LuxiaToken not loaded');
      
      // Cache token info since it rarely changes
      return await this.getOrCache('luxia:info', async () => {
        const info = await this.luxiaToken.getTokenInfo();
        return {
          name: info[0],
          symbol: info[1],
          decimals: Number(info[2]),
          totalSupply: ethers.formatEther(info[3]),
          maxSupply: ethers.formatEther(info[4]),
          address: this.contractAddresses.luxia
        };
      }, 60000); // Cache for 1 minute
    } catch (error) {
      throw new Error(`Failed to get Luxia token info: ${error.message}`);
    }
  }

  async getLuxiaBalance(address) {
    try {
      if (!this.luxiaToken) throw new Error('LuxiaToken not loaded');
      
      const balance = await this.luxiaToken.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      throw new Error(`Failed to get Luxia balance: ${error.message}`);
    }
  }

  async transferLuxia(to, amount) {
    try {
      if (!this.luxiaToken) throw new Error('LuxiaToken not loaded');
      
      const tx = await this.luxiaToken.transfer(to, ethers.parseEther(amount.toString()));
      const receipt = await tx.wait();
      
      // Clear cache after state-changing operation
      this.clearCache();
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to transfer Luxia: ${error.message}`);
    }
  }

  async mintLuxia(to, amount) {
    try {
      if (!this.luxiaToken) throw new Error('LuxiaToken not loaded');
      
      const tx = await this.luxiaToken.mint(to, ethers.parseEther(amount.toString()));
      const receipt = await tx.wait();
      
      // Clear cache after state-changing operation
      this.clearCache();
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to mint Luxia: ${error.message}`);
    }
  }

  // NOTORIOUS Token Methods
  async getNotoriusTokenInfo() {
    try {
      if (!this.notoriusToken) throw new Error('NotoriusToken not loaded');
      
      // Cache token info since it rarely changes (except for paused state)
      return await this.getOrCache('notorious:info', async () => {
        const info = await this.notoriusToken.getTokenInfo();
        return {
          name: info[0],
          symbol: info[1],
          decimals: Number(info[2]),
          totalSupply: ethers.formatEther(info[3]),
          maxSupply: ethers.formatEther(info[4]),
          transferFee: `${Number(info[5]) / 100}%`,
          feeCollector: info[6],
          paused: info[7],
          address: this.contractAddresses.notorious
        };
      }, 30000); // Cache for 30 seconds (shorter due to mutable state)
    } catch (error) {
      throw new Error(`Failed to get Notorious token info: ${error.message}`);
    }
  }

  async getNotoriusBalance(address) {
    try {
      if (!this.notoriusToken) throw new Error('NotoriusToken not loaded');
      
      const balance = await this.notoriusToken.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      throw new Error(`Failed to get Notorious balance: ${error.message}`);
    }
  }

  async transferNotorious(to, amount) {
    try {
      if (!this.notoriusToken) throw new Error('NotoriusToken not loaded');
      
      const tx = await this.notoriusToken.transfer(to, ethers.parseEther(amount.toString()));
      const receipt = await tx.wait();
      
      // Clear cache after state-changing operation
      this.clearCache();
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to transfer Notorious: ${error.message}`);
    }
  }

  async setNotoriusFee(feePercent) {
    try {
      if (!this.notoriusToken) throw new Error('NotoriusToken not loaded');
      
      const tx = await this.notoriusToken.setTransferFee(feePercent * 100); // Convert to basis points
      const receipt = await tx.wait();
      
      // Clear cache after state-changing operation
      this.clearCache();
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to set Notorious fee: ${error.message}`);
    }
  }

  async blacklistAddress(address) {
    try {
      if (!this.notoriusToken) throw new Error('NotoriusToken not loaded');
      
      const tx = await this.notoriusToken.blacklistAddress(address);
      const receipt = await tx.wait();
      
      // Clear cache after state-changing operation
      this.clearCache();
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to blacklist address: ${error.message}`);
    }
  }

  async pauseNotorious() {
    try {
      if (!this.notoriusToken) throw new Error('NotoriusToken not loaded');
      
      const tx = await this.notoriusToken.pause();
      const receipt = await tx.wait();
      
      // Clear cache after state-changing operation
      this.clearCache();
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      throw new Error(`Failed to pause Notorious: ${error.message}`);
    }
  }

  // General methods
  async getBlockNumber() {
    try {
      if (!this.provider) throw new Error('Provider not initialized');
      return await this.provider.getBlockNumber();
    } catch (error) {
      throw new Error(`Failed to get block number: ${error.message}`);
    }
  }

  async getBalance(address) {
    try {
      if (!this.provider) throw new Error('Provider not initialized');
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      throw new Error(`Failed to get ETH balance: ${error.message}`);
    }
  }
}

module.exports = Web3Service;