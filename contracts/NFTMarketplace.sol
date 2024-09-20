// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

    contract NFTMarketplace is ERC721, Ownable {

        uint256 private _currentTokenId;

        struct NFTSales {
            address seller;
            uint256 price;
            bool isListed;
        }

     // Mapping from token ID to Sale struct
    mapping(uint256 => NFTSales) public tokenSale;

    // Event to notify when a new NFT is minted
    event Minted(uint256 indexed tokenId, address owner);

    // Event to notify when an NFT is listed for sale
    event ListedForSale(uint256 indexed tokenId, uint256 price);

    // Event to notify when an NFT is sold
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

    // List NFT for sale, must be owner of the token
    function listNFTForSale(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "You do not own this token");
        require(price > 0, "Price must be greater than 0");

        tokenSale[tokenId] = NFTSales({
            seller: msg.sender,
            price: price,
            isListed: true
        });

        emit ListedForSale(tokenId, price);
    }

    // Buy an NFT that is listed for sale
    function buyNFT(uint256 tokenId) external payable {
        NFTSales memory sale = tokenSale[tokenId];
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
        NFTSales memory sale = tokenSale[tokenId];
        return (sale.seller, sale.price, sale.isListed);
    }

    // Override required by Solidity to ensure ownership transfer respects sale listings
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);

        // If the token is transferred (sold or manually transferred), remove the sale listing
        if (from != address(0) && tokenSale[tokenId].isListed) {
            tokenSale[tokenId].isListed = false;
        }
    }
}