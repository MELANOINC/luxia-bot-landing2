// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NotoriusToken
 * @dev ERC20 Token with advanced features for the Notorius ecosystem
 * Features:
 * - Standard ERC20 functionality
 * - Burnable tokens
 * - Pausable functionality
 * - Owner-controlled minting
 * - Transfer fees
 * - Blacklist functionality
 */
contract NotoriusToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    
    // Token details
    uint256 public constant INITIAL_SUPPLY = 500000 * 10**18; // 500k tokens
    uint256 public constant MAX_SUPPLY = 5000000 * 10**18; // 5 million tokens max
    
    // Fee settings
    uint256 public transferFeePercent = 100; // 1% = 100 basis points
    address public feeCollector;
    
    // Blacklist mapping
    mapping(address => bool) public blacklisted;
    
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    event TransferFeeUpdated(uint256 newFeePercent);
    event FeeCollectorUpdated(address newFeeCollector);
    event AddressBlacklisted(address indexed account);
    event AddressUnblacklisted(address indexed account);
    event FeesCollected(address indexed from, address indexed to, uint256 amount);
    
    constructor(address initialOwner) ERC20("Notorius Token", "NOTORIOUS") Ownable(initialOwner) {
        feeCollector = initialOwner;
        _mint(initialOwner, INITIAL_SUPPLY);
        emit TokensMinted(initialOwner, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "NotoriusToken: Would exceed max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Set transfer fee percentage (only owner)
     * @param _feePercent Fee percentage in basis points (100 = 1%)
     */
    function setTransferFee(uint256 _feePercent) public onlyOwner {
        require(_feePercent <= 1000, "NotoriusToken: Fee cannot exceed 10%");
        transferFeePercent = _feePercent;
        emit TransferFeeUpdated(_feePercent);
    }
    
    /**
     * @dev Set fee collector address (only owner)
     * @param _feeCollector New fee collector address
     */
    function setFeeCollector(address _feeCollector) public onlyOwner {
        require(_feeCollector != address(0), "NotoriusToken: Fee collector cannot be zero address");
        feeCollector = _feeCollector;
        emit FeeCollectorUpdated(_feeCollector);
    }
    
    /**
     * @dev Add address to blacklist (only owner)
     * @param account Address to blacklist
     */
    function blacklistAddress(address account) public onlyOwner {
        require(account != owner(), "NotoriusToken: Cannot blacklist owner");
        blacklisted[account] = true;
        emit AddressBlacklisted(account);
    }
    
    /**
     * @dev Remove address from blacklist (only owner)
     * @param account Address to unblacklist
     */
    function unblacklistAddress(address account) public onlyOwner {
        blacklisted[account] = false;
        emit AddressUnblacklisted(account);
    }
    
    /**
     * @dev Pause token transfers (only owner)
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers (only owner)
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer to include fees and blacklist checks
     */
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        // Check blacklist
        require(!blacklisted[from], "NotoriusToken: Sender is blacklisted");
        require(!blacklisted[to], "NotoriusToken: Recipient is blacklisted");
        
        // If it's a mint or burn, no fees
        if (from == address(0) || to == address(0)) {
            super._update(from, to, value);
            return;
        }
        
        // If owner is involved, no fees
        if (from == owner() || to == owner()) {
            super._update(from, to, value);
            return;
        }
        
        // Calculate fee
        uint256 fee = (value * transferFeePercent) / 10000;
        uint256 transferAmount = value - fee;
        
        // Transfer fee to collector
        if (fee > 0) {
            super._update(from, feeCollector, fee);
            emit FeesCollected(from, feeCollector, fee);
        }
        
        // Transfer remaining amount
        super._update(from, to, transferAmount);
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
        uint256 maxSupply_,
        uint256 transferFee_,
        address feeCollector_,
        bool paused_
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            MAX_SUPPLY,
            transferFeePercent,
            feeCollector,
            paused()
        );
    }
}