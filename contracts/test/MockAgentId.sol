// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @notice Test-only mock of the SPACE ID Agent ID contract (ERC-721).
///         Used by the local test suite so claim() eligibility can be tested
///         without the real mainnet Agent ID contract. NOT part of the
///         production deployment.
contract MockAgentId is ERC721 {
    uint256 private _nextId;

    constructor() ERC721("Mock Agent ID", "MAID") {}

    function mint(address to) external returns (uint256) {
        uint256 tokenId = ++_nextId;
        _safeMint(to, tokenId);
        return tokenId;
    }
}
