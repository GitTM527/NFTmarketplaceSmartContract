import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTMarketplace Ownership", function () {
  let nftMarketplace: any;
  let owner: any;
  let newOwner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    [owner, newOwner, addr1, addr2] = await ethers.getSigners();
    nftMarketplace = await NFTMarketplace.deploy();
    // await nftMarketplace.deployed();
  });


    it("Should initialize currentTokenId to 0", async function () {
    // Check initial value of currentTokenId
        expect(await nftMarketplace.getCurrentTokenId()).to.equal(0);
 });

     it("Should mint an NFT and assign correct tokenId", async function () {
    // Mint an NFT to addr1
    const tx = await nftMarketplace.mintNFT(addr1.address);
    await tx.wait();

    // Check that the first tokenId is 1
    expect(await nftMarketplace.ownerOf(1)).to.equal(addr1.address);

    // Verify the currentTokenId has been incremented
    expect(await nftMarketplace.getCurrentTokenId()).to.equal(1);
  });

    it("Should increment tokenId correctly when minting multiple NFTs", async function () {
    // Mint first NFT to addr1
    await nftMarketplace.mintNFT(addr1.address);
    expect(await nftMarketplace.ownerOf(1)).to.equal(addr1.address);

    // Mint second NFT to addr2
    await nftMarketplace.mintNFT(addr2.address);
    expect(await nftMarketplace.ownerOf(2)).to.equal(addr2.address);

    // Verify that currentTokenId is now 2
    expect(await nftMarketplace.getCurrentTokenId()).to.equal(2);
  });
});










//   it("Should transfer ownership to a new owner", async function () {
//     // Transfer ownership to the new owner
//     await nftMarketplace.transferOwnership(newOwner.address);

//     // Check the new owner
//     expect(await nftMarketplace.owner()).to.equal(newOwner.address);
//   });

//   it("Should allow the new owner to call onlyOwner functions", async function () {
//     // Transfer ownership to the new owner
//     await nftMarketplace.transferOwnership(newOwner.address);

//     // Mint an NFT with the new owner
//     await nftMarketplace.connect(newOwner).mintNFT(newOwner.address);
//     const ownerOfNewNFT = await nftMarketplace.ownerOf(1);
    
//     expect(ownerOfNewNFT).to.equal(newOwner.address);
//   });

//   it("Should renounce ownership", async function () {
//     // Renounce ownership
//     await nftMarketplace.renounceOwnership();

//     // Check that there's no owner
//     expect(await nftMarketplace.owner()).to.equal(ethers.constants.AddressZero);
//   });
