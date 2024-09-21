// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

    contract NFTMarketplace is ERC721, Ownable {

        uint256 private _currentTokenId;

        struct NFTSale {
            address seller;
            uint256 price;
            bool isListed;
        }

    
     // Mapping from token ID to NFTSale struct
    mapping(uint256 => NFTSale) public tokenSale;

    // Event emitted when a new NFT is minted
    event Minted(uint256 indexed tokenId, address owner);

    // Event emitted when an NFT is listed for sale
    event ListedForSale(uint256 indexed tokenId, uint256 price);

    // Event emitted when an NFT is sold
    event Sold(uint256 indexed tokenId, address buyer, uint256 price);

   
   
    // Constructor initializes the contract with a name and symbol
    constructor() ERC721("MyNFTMarketplace", "MNFT") Ownable(msg.sender) {
        _currentTokenId = 0;  // Initialize the token ID counter
    }


    // Mint new NFTs; only the contract owner can mint
    function mintNFT(address recipient) external onlyOwner returns (uint256) {
        _currentTokenId++;  // Increment the token ID manually
        uint256 newItemId = _currentTokenId;
        _mint(recipient, newItemId);
 
        emit Minted(newItemId, recipient);
        return newItemId;
    }

    function getCurrentTokenId() external view returns (uint256) {
        return _currentTokenId;
    }

    // List NFT for sale, must be owner of the token
    function listNFTForSale(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "You do not own this token");
        require(price > 0, "Price must be greater than 0");

        tokenSale[tokenId] = NFTSale({
            seller: msg.sender,
            price: price,
            isListed: true
        });

        emit ListedForSale(tokenId, price);
    }

    // Buy an NFT that is listed for sale
    function buyNFT(uint256 tokenId) external payable {
        NFTSale memory sale = tokenSale[tokenId];
        require(sale.isListed, "This NFT is not for sale");
        require(msg.value == sale.price, "Incorrect price");

        address seller = sale.seller;
        _transfer(seller, msg.sender, tokenId);

        // Clear the sale listing
        tokenSale[tokenId].isListed = false;

        // Transfer funds to the seller
        payable(seller).transfer(msg.value);

        emit Sold(tokenId, msg.sender, sale.price);
    }

    // Remove NFT from the marketplace (cancel sale), only owner can remove
    function removeFromSale(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "You do not own this token");
        require(tokenSale[tokenId].isListed, "This token is not listed for sale");

        tokenSale[tokenId].isListed = false;
    }

    // Get the sale status of an NFT
    function getSaleInfo(uint256 tokenId) external view returns (address, uint256, bool) {
        NFTSale memory sale = tokenSale[tokenId];
        return (sale.seller, sale.price, sale.isListed);
    }

}