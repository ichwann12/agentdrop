// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title AgentDrop — a free badge for Binance Agent ID holders
/// @notice One free ERC-721 badge per Agent ID holder. Price is exactly 0 (gas only).
/// @dev No owner privileges: no Ownable, no pause, no admin mint, no withdraw
///      (there is nothing to withdraw — claiming is free), no upgradeability.
///      The Agent ID contract address is immutable and set once in the constructor.
///      Eligibility is checked on-chain against the SPACE ID Agent ID contract
///      (BNB Chain mainnet: 0x60b9262456de011f7d15a54cdd8c48baaa8b022f).
interface IAgentId {
    function balanceOf(address owner) external view returns (uint256);
}

contract AgentDrop is ERC721 {
    using Strings for uint256;

    /// @notice The Agent ID (SPACE ID, ERC-721) contract used for eligibility.
    IAgentId public immutable AGENT_ID;

    /// @notice Maximum number of badges that can ever be claimed.
    uint256 public constant MAX_SUPPLY = 10000;

    /// @notice Total badges claimed so far.
    uint256 public totalClaimed;

    /// @notice True once an address has claimed its one badge.
    mapping(address => bool) public claimed;

    /// @notice Emitted when a badge is claimed.
    event Claimed(address indexed claimer, uint256 indexed tokenId);

    error NotAgentIdHolder();
    error AlreadyClaimed();
    error MaxSupplyReached();

    constructor(address agentIdContract) ERC721("AgentDrop Badge", "AGENTDROP") {
        AGENT_ID = IAgentId(agentIdContract);
    }

    /// @notice Claim one free badge. Caller must hold an Agent ID and must not
    ///         have claimed before. Price is 0; only gas is paid by the caller.
    function claim() external {
        if (AGENT_ID.balanceOf(msg.sender) == 0) revert NotAgentIdHolder();
        if (claimed[msg.sender]) revert AlreadyClaimed();
        if (totalClaimed >= MAX_SUPPLY) revert MaxSupplyReached();

        claimed[msg.sender] = true;
        totalClaimed += 1;
        uint256 tokenId = totalClaimed;

        _safeMint(msg.sender, tokenId);
        emit Claimed(msg.sender, tokenId);
    }

    /// @notice Fully on-chain metadata: JSON data URI with a base64 SVG badge.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert ERC721NonexistentToken(tokenId);

        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">',
                '<rect width="640" height="640" rx="32" fill="#0b0f1a"/>',
                '<rect x="24" y="24" width="592" height="592" rx="24" fill="none" stroke="#f0b90b" stroke-width="6"/>',
                '<circle cx="320" cy="220" r="96" fill="#f0b90b"/>',
                '<circle cx="320" cy="220" r="96" fill="none" stroke="#0b0f1a" stroke-width="6"/>',
                '<text x="320" y="248" font-family="sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="#0b0f1a">A</text>',
                '<text x="320" y="400" font-family="sans-serif" font-size="52" font-weight="bold" text-anchor="middle" fill="#ffffff">AgentDrop</text>',
                '<text x="320" y="452" font-family="sans-serif" font-size="28" text-anchor="middle" fill="#f0b90b">AGENT ID HOLDER</text>',
                '<text x="320" y="540" font-family="sans-serif" font-size="30" text-anchor="middle" fill="#9aa3b2">Badge #',
                tokenId.toString(),
                '</text>',
                "</svg>"
            )
        );

        string memory json = string(
            abi.encodePacked(
                '{"name":"AgentDrop Badge #',
                tokenId.toString(),
                '","description":"A free badge for Binance Agent ID holders, claimed on BNB Chain. AgentDrop: free claim, gas only - no fees, no promises.","image":"data:image/svg+xml;base64,',
                Base64.encode(bytes(svg)),
                '","attributes":[{"trait_type":"Badge","value":"Agent ID Holder"},{"trait_type":"Token ID","value":"',
                tokenId.toString(),
                '"}]}'
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }
}
