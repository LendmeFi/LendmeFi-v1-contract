// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDC is ERC20 {
    uint256 public initialSupply = 1000000 * 10 ** 6;
    constructor() ERC20("USDC Token", "USDC") {
        _mint(msg.sender, initialSupply);
    }
}
