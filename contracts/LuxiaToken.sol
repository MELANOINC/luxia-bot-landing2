// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LuxiaToken
 * @dev ERC20 Token for the Luxia Bot ecosystem
 * Features:
 * - Standard ERC20 functionality
 * - Burnable tokens
 * - Owner-controlled minting
 * - Initial supply distribution
 */
contract LuxiaToken is ERC20, ERC20Burnable, Ownable {
    
    // Token details
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public constant MAX_SUPPLY = 10000000 * 10**18; // 10 million tokens max
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    constructor(address initialOwner) ERC20("Luxia Token", "LUXIA") Ownable(initialOwner) {
        _mint(initialOwner, INITIAL_SUPPLY);
        emit TokensMinted(initialOwner, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "LuxiaToken: Would exceed max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Burn tokens from specified account (with allowance)
     * @param account Account to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }
    
    /**
     * @dev Get token information
     */
    function getTokenInfo() public view returns (
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_,
        uint256 maxSupply_
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            MAX_SUPPLY
        );
    }
}