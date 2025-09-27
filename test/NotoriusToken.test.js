const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NotoriusToken", function () {
  let notoriusToken;
  let owner;
  let addr1;
  let addr2;
  let feeCollector;

  beforeEach(async function () {
    [owner, addr1, addr2, feeCollector] = await ethers.getSigners();
    
    const NotoriusToken = await ethers.getContractFactory("NotoriusToken");
    notoriusToken = await NotoriusToken.deploy(owner.address);
    await notoriusToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner and fee collector", async function () {
      expect(await notoriusToken.owner()).to.equal(owner.address);
      expect(await notoriusToken.feeCollector()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await notoriusToken.balanceOf(owner.address);
      expect(await notoriusToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct token details", async function () {
      expect(await notoriusToken.name()).to.equal("Notorius Token");
      expect(await notoriusToken.symbol()).to.equal("NOTORIOUS");
      expect(await notoriusToken.decimals()).to.equal(18);
    });

    it("Should have correct initial supply", async function () {
      const expectedSupply = ethers.parseEther("500000"); // 500k tokens
      expect(await notoriusToken.totalSupply()).to.equal(expectedSupply);
    });

    it("Should have default transfer fee of 1%", async function () {
      expect(await notoriusToken.transferFeePercent()).to.equal(100);
    });
  });

  describe("Fee Management", function () {
    it("Should allow owner to set transfer fee", async function () {
      const newFee = 200; // 2%
      await notoriusToken.setTransferFee(newFee);
      expect(await notoriusToken.transferFeePercent()).to.equal(newFee);
    });

    it("Should not allow fee above 10%", async function () {
      const highFee = 1001; // 10.01%
      await expect(
        notoriusToken.setTransferFee(highFee)
      ).to.be.revertedWith("NotoriusToken: Fee cannot exceed 10%");
    });

    it("Should allow owner to set fee collector", async function () {
      await notoriusToken.setFeeCollector(feeCollector.address);
      expect(await notoriusToken.feeCollector()).to.equal(feeCollector.address);
    });

    it("Should not allow zero address as fee collector", async function () {
      await expect(
        notoriusToken.setFeeCollector(ethers.ZeroAddress)
      ).to.be.revertedWith("NotoriusToken: Fee collector cannot be zero address");
    });

    it("Should not allow non-owner to set fee or collector", async function () {
      await expect(
        notoriusToken.connect(addr1).setTransferFee(200)
      ).to.be.revertedWithCustomError(notoriusToken, "OwnableUnauthorizedAccount");

      await expect(
        notoriusToken.connect(addr1).setFeeCollector(feeCollector.address)
      ).to.be.revertedWithCustomError(notoriusToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Transfer Fees", function () {
    it("Should charge fees on regular transfers", async function () {
      const transferAmount = ethers.parseEther("1000");
      const expectedFee = ethers.parseEther("10"); // 1% of 1000
      const expectedReceived = transferAmount - expectedFee;

      await notoriusToken.transfer(addr1.address, transferAmount);
      await notoriusToken.connect(addr1).transfer(addr2.address, transferAmount);

      const addr2Balance = await notoriusToken.balanceOf(addr2.address);
      const ownerBalance = await notoriusToken.balanceOf(owner.address);

      expect(addr2Balance).to.equal(expectedReceived);
      // Owner should have received the fee
      expect(ownerBalance).to.be.greaterThan(ethers.parseEther("499000")); // Initial - transfer + fee
    });

    it("Should not charge fees on owner transfers", async function () {
      const transferAmount = ethers.parseEther("1000");

      await notoriusToken.transfer(addr1.address, transferAmount);
      const addr1Balance = await notoriusToken.balanceOf(addr1.address);

      expect(addr1Balance).to.equal(transferAmount); // No fee deducted
    });

    it("Should collect fees to designated collector", async function () {
      await notoriusToken.setFeeCollector(feeCollector.address);
      
      const transferAmount = ethers.parseEther("1000");
      const expectedFee = ethers.parseEther("10"); // 1% of 1000

      await notoriusToken.transfer(addr1.address, transferAmount);
      await notoriusToken.connect(addr1).transfer(addr2.address, transferAmount);

      const feeCollectorBalance = await notoriusToken.balanceOf(feeCollector.address);
      expect(feeCollectorBalance).to.equal(expectedFee);
    });
  });

  describe("Blacklist Functionality", function () {
    it("Should allow owner to blacklist addresses", async function () {
      await notoriusToken.blacklistAddress(addr1.address);
      expect(await notoriusToken.blacklisted(addr1.address)).to.be.true;
    });

    it("Should allow owner to unblacklist addresses", async function () {
      await notoriusToken.blacklistAddress(addr1.address);
      await notoriusToken.unblacklistAddress(addr1.address);
      expect(await notoriusToken.blacklisted(addr1.address)).to.be.false;
    });

    it("Should prevent blacklisted addresses from receiving tokens", async function () {
      await notoriusToken.blacklistAddress(addr1.address);
      
      await expect(
        notoriusToken.transfer(addr1.address, ethers.parseEther("100"))
      ).to.be.revertedWith("NotoriusToken: Recipient is blacklisted");
    });

    it("Should prevent blacklisted addresses from sending tokens", async function () {
      const transferAmount = ethers.parseEther("1000");
      await notoriusToken.transfer(addr1.address, transferAmount);
      
      await notoriusToken.blacklistAddress(addr1.address);
      
      await expect(
        notoriusToken.connect(addr1).transfer(addr2.address, ethers.parseEther("100"))
      ).to.be.revertedWith("NotoriusToken: Sender is blacklisted");
    });

    it("Should not allow blacklisting the owner", async function () {
      await expect(
        notoriusToken.blacklistAddress(owner.address)
      ).to.be.revertedWith("NotoriusToken: Cannot blacklist owner");
    });
  });

  describe("Pausable Functionality", function () {
    it("Should allow owner to pause and unpause", async function () {
      await notoriusToken.pause();
      expect(await notoriusToken.paused()).to.be.true;

      await notoriusToken.unpause();
      expect(await notoriusToken.paused()).to.be.false;
    });

    it("Should prevent transfers when paused", async function () {
      await notoriusToken.pause();
      
      await expect(
        notoriusToken.transfer(addr1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(notoriusToken, "EnforcedPause");
    });

    it("Should not allow non-owner to pause/unpause", async function () {
      await expect(
        notoriusToken.connect(addr1).pause()
      ).to.be.revertedWithCustomError(notoriusToken, "OwnableUnauthorizedAccount");

      await notoriusToken.pause();
      
      await expect(
        notoriusToken.connect(addr1).unpause()
      ).to.be.revertedWithCustomError(notoriusToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      const initialSupply = await notoriusToken.totalSupply();
      
      await notoriusToken.mint(addr1.address, mintAmount);
      
      const finalSupply = await notoriusToken.totalSupply();
      expect(finalSupply).to.equal(initialSupply + mintAmount);
      
      const addr1Balance = await notoriusToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(mintAmount);
    });

    it("Should not allow minting beyond max supply", async function () {
      const maxSupply = ethers.parseEther("5000000"); // 5 million
      const currentSupply = await notoriusToken.totalSupply();
      const excessAmount = maxSupply - currentSupply + 1n;
      
      await expect(
        notoriusToken.mint(addr1.address, excessAmount)
      ).to.be.revertedWith("NotoriusToken: Would exceed max supply");
    });
  });

  describe("Token Info", function () {
    it("Should return correct token information", async function () {
      const tokenInfo = await notoriusToken.getTokenInfo();
      
      expect(tokenInfo[0]).to.equal("Notorius Token");
      expect(tokenInfo[1]).to.equal("NOTORIOUS");
      expect(tokenInfo[2]).to.equal(18);
      expect(tokenInfo[3]).to.equal(ethers.parseEther("500000"));
      expect(tokenInfo[4]).to.equal(ethers.parseEther("5000000"));
      expect(tokenInfo[5]).to.equal(100); // transfer fee
      expect(tokenInfo[6]).to.equal(owner.address); // fee collector
      expect(tokenInfo[7]).to.be.false; // not paused
    });
  });
});