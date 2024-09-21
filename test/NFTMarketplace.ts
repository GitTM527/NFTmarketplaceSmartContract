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

 describe("mintNFT", async function() {
    
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


  describe("listNFTForSale", async function() {
    it("should check that owner of tokenId is the seller", async function() {
        await nftMarketplace.connect(owner).mintNFT(owner.address);
        const ownerOftokenId = await nftMarketplace.ownerOf(1);
        expect(await ownerOftokenId).to.be.revertedWith("you do not own this token")
    })

    it("should fail when if NFT listed has price equals zero", async function(){
        await nftMarketplace.connect(owner).mintNFT(owner.address);
        await expect(nftMarketplace.connect(owner).listNFTForSale(1, 0)
          ).to.be.revertedWith("Price must be greater than 0");
    })

    it("Should successfully list an NFT with price greater than 0", async function () {
        // List NFT with tokenId 1 for a valid price (e.g., 100)
        await nftMarketplace.connect(owner).mintNFT(owner.address);
        await expect(nftMarketplace.connect(owner).listNFTForSale(1, 100))
          .to.emit(nftMarketplace, "ListedForSale")
          .withArgs(1, 100);
    
        // Check that the sale price is correctly set
        const sale = await nftMarketplace.tokenSale(1);
        expect(sale.price).to.equal(100);
        expect(sale.isListed).to.be.true;
  })
})

})
})










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
