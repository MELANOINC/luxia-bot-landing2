const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LuxiaToken", function () {
  let luxiaToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const LuxiaToken = await ethers.getContractFactory("LuxiaToken");
    luxiaToken = await LuxiaToken.deploy(owner.address);
    await luxiaToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await luxiaToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await luxiaToken.balanceOf(owner.address);
      expect(await luxiaToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct token details", async function () {
      expect(await luxiaToken.name()).to.equal("Luxia Token");
      expect(await luxiaToken.symbol()).to.equal("LUXIA");
      expect(await luxiaToken.decimals()).to.equal(18);
    });

    it("Should have correct initial supply", async function () {
      const expectedSupply = ethers.parseEther("1000000"); // 1 million tokens
      expect(await luxiaToken.totalSupply()).to.equal(expectedSupply);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseEther("50");
      
      await luxiaToken.transfer(addr1.address, transferAmount);
      const addr1Balance = await luxiaToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);

      await luxiaToken.connect(addr1).transfer(addr2.address, transferAmount);
      const addr2Balance = await luxiaToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await luxiaToken.balanceOf(owner.address);
      const transferAmount = initialOwnerBalance + 1n;

      await expect(
        luxiaToken.connect(addr1).transfer(owner.address, transferAmount)
      ).to.be.revertedWithCustomError(luxiaToken, "ERC20InsufficientBalance");
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await luxiaToken.balanceOf(owner.address);
      const transferAmount = ethers.parseEther("100");

      await luxiaToken.transfer(addr1.address, transferAmount);
      await luxiaToken.transfer(addr2.address, transferAmount);

      const finalOwnerBalance = await luxiaToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - transferAmount * 2n);

      const addr1Balance = await luxiaToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);

      const addr2Balance = await luxiaToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(transferAmount);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      const initialSupply = await luxiaToken.totalSupply();
      
      await luxiaToken.mint(addr1.address, mintAmount);
      
      const finalSupply = await luxiaToken.totalSupply();
      expect(finalSupply).to.equal(initialSupply + mintAmount);
      
      const addr1Balance = await luxiaToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await expect(
        luxiaToken.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.revertedWithCustomError(luxiaToken, "OwnableUnauthorizedAccount");
    });

    it("Should not allow minting beyond max supply", async function () {
      const maxSupply = ethers.parseEther("10000000"); // 10 million
      const currentSupply = await luxiaToken.totalSupply();
      const excessAmount = maxSupply - currentSupply + 1n;
      
      await expect(
        luxiaToken.mint(addr1.address, excessAmount)
      ).to.be.revertedWith("LuxiaToken: Would exceed max supply");
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their tokens", async function () {
      const transferAmount = ethers.parseEther("1000");
      const burnAmount = ethers.parseEther("500");
      
      await luxiaToken.transfer(addr1.address, transferAmount);
      const initialBalance = await luxiaToken.balanceOf(addr1.address);
      const initialSupply = await luxiaToken.totalSupply();
      
      await luxiaToken.connect(addr1).burn(burnAmount);
      
      const finalBalance = await luxiaToken.balanceOf(addr1.address);
      const finalSupply = await luxiaToken.totalSupply();
      
      expect(finalBalance).to.equal(initialBalance - burnAmount);
      expect(finalSupply).to.equal(initialSupply - burnAmount);
    });

    it("Should allow burning from approved account", async function () {
      const transferAmount = ethers.parseEther("1000");
      const burnAmount = ethers.parseEther("500");
      
      await luxiaToken.transfer(addr1.address, transferAmount);
      await luxiaToken.connect(addr1).approve(addr2.address, burnAmount);
      
      const initialBalance = await luxiaToken.balanceOf(addr1.address);
      const initialSupply = await luxiaToken.totalSupply();
      
      await luxiaToken.connect(addr2).burnFrom(addr1.address, burnAmount);
      
      const finalBalance = await luxiaToken.balanceOf(addr1.address);
      const finalSupply = await luxiaToken.totalSupply();
      
      expect(finalBalance).to.equal(initialBalance - burnAmount);
      expect(finalSupply).to.equal(initialSupply - burnAmount);
    });
  });

  describe("Token Info", function () {
    it("Should return correct token information", async function () {
      const tokenInfo = await luxiaToken.getTokenInfo();
      
      expect(tokenInfo[0]).to.equal("Luxia Token");
      expect(tokenInfo[1]).to.equal("LUXIA");
      expect(tokenInfo[2]).to.equal(18);
      expect(tokenInfo[3]).to.equal(ethers.parseEther("1000000"));
      expect(tokenInfo[4]).to.equal(ethers.parseEther("10000000"));
    });
  });
});