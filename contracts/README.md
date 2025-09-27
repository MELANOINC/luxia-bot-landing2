# Smart Contracts - Luxia & Notorious ERC-20 Tokens

This directory contains the ERC-20 smart contracts for the Luxia Bot ecosystem.

## Contracts Overview

### 1. LuxiaToken (LUXIA)
A standard ERC-20 token with the following features:
- **Name**: Luxia Token
- **Symbol**: LUXIA
- **Initial Supply**: 1,000,000 LUXIA
- **Max Supply**: 10,000,000 LUXIA
- **Features**:
  - Standard ERC-20 functionality
  - Burnable tokens
  - Owner-controlled minting
  - Supply cap enforcement

### 2. NotoriusToken (NOTORIOUS)
An advanced ERC-20 token with additional features:
- **Name**: Notorius Token
- **Symbol**: NOTORIOUS
- **Initial Supply**: 500,000 NOTORIOUS
- **Max Supply**: 5,000,000 NOTORIOUS
- **Features**:
  - Standard ERC-20 functionality
  - Burnable tokens
  - Pausable functionality
  - Transfer fees (default 1%)
  - Blacklist functionality
  - Owner-controlled minting

## Getting Started

### 1. Installation & Compilation

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile
```

### 2. Testing

```bash
# Run all tests
npm test

# Run specific contract tests
npx hardhat test test/LuxiaToken.test.js
npx hardhat test test/NotoriusToken.test.js
```

### 3. Deployment

```bash
# Start local hardhat node
npm run node

# Deploy contracts (in another terminal)
npm run deploy
```

## API Integration

The Express server includes Web3 endpoints to interact with the deployed contracts:

### Web3 Status
- `GET /web3/status` - Check Web3 service status

### LUXIA Token Endpoints
- `GET /tokens/luxia/info` - Get token information
- `GET /tokens/luxia/balance/:address` - Get balance of an address
- `POST /tokens/luxia/transfer` - Transfer tokens
- `POST /tokens/luxia/mint` - Mint new tokens (owner only)

### NOTORIOUS Token Endpoints
- `GET /tokens/notorious/info` - Get token information
- `GET /tokens/notorious/balance/:address` - Get balance of an address
- `POST /tokens/notorious/transfer` - Transfer tokens (with fees)
- `POST /tokens/notorious/set-fee` - Set transfer fee percentage
- `POST /tokens/notorious/blacklist` - Blacklist an address
- `POST /tokens/notorious/pause` - Pause token transfers

### Setup Endpoints
- `POST /web3/initialize` - Initialize Web3 service
- `POST /web3/load-contracts` - Load contract instances

## Example Usage

### Initialize Web3 Service
```bash
curl -X POST http://localhost:5678/web3/initialize \
  -H "Content-Type: application/json" \
  -d '{"providerUrl": "http://localhost:8545"}'
```

### Load Contracts
```bash
curl -X POST http://localhost:5678/web3/load-contracts \
  -H "Content-Type: application/json" \
  -d '{
    "luxiaAddress": "0x...",
    "notoriusAddress": "0x..."
  }'
```

### Get Token Info
```bash
curl http://localhost:5678/tokens/luxia/info
curl http://localhost:5678/tokens/notorious/info
```

### Transfer Tokens
```bash
# Transfer LUXIA tokens
curl -X POST http://localhost:5678/tokens/luxia/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x...",
    "amount": 100
  }'

# Transfer NOTORIOUS tokens (with fees)
curl -X POST http://localhost:5678/tokens/notorious/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x...",
    "amount": 100
  }'
```

## Contract Features

### LuxiaToken Features

#### Minting
- Only the contract owner can mint new tokens
- Cannot exceed the maximum supply of 10 million tokens
- Emits `TokensMinted` event

#### Burning
- Any token holder can burn their own tokens
- Token holders can approve others to burn tokens on their behalf
- Emits `TokensBurned` event

### NotoriusToken Features

#### Transfer Fees
- Default 1% fee on all transfers (except owner transfers)
- Fees are collected by the designated fee collector
- Fee percentage can be adjusted (max 10%)

#### Blacklist
- Owner can blacklist addresses to prevent them from sending/receiving tokens
- Blacklisted addresses cannot participate in token transfers
- Owner cannot be blacklisted

#### Pausable
- Owner can pause all token transfers
- Useful for emergency situations or maintenance
- Minting and burning are not affected by pause state

## Security Features

1. **Ownable**: Both contracts use OpenZeppelin's Ownable pattern
2. **Supply Caps**: Both tokens have maximum supply limits
3. **Reentrancy Protection**: Inherited from OpenZeppelin contracts
4. **Input Validation**: Comprehensive checks on all functions
5. **Event Logging**: All important actions emit events

## Development & Testing

### Local Development
```bash
# Terminal 1: Start local blockchain
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Start Express server
npm start
```

### Testing Scenarios
The test suites cover:
- Token deployment and initialization
- Transfer functionality
- Minting and burning
- Fee collection (NOTORIOUS)
- Blacklist functionality (NOTORIOUS)
- Pausable functionality (NOTORIOUS)
- Access control
- Edge cases and error conditions

## Contract Addresses (Local)

After deployment, contract addresses will be displayed. Update your Web3 service configuration with these addresses to interact with the contracts through the API.

## Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **Environment Variables**: Use `.env` files for sensitive configuration
3. **Owner Privileges**: The contract owner has significant control - use multi-sig wallets in production
4. **Fee Settings**: Monitor transfer fees to ensure they remain reasonable
5. **Blacklist Usage**: Use blacklist functionality responsibly and transparently