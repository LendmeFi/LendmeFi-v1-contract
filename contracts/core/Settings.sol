// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "../access/Ownable.sol";
import {Pausable} from "../utils/Pausable.sol";
import {ReentrancyGuard} from "../utils/ReentrancyGuard.sol";

contract Settings is Ownable, Pausable, ReentrancyGuard {
    mapping(address => bool) public erc20whitelist;
    mapping(address => bool) public erc721whitelist;

    uint256 public lendmeFiFeeBasisPoint = 200; // 2% fee for LendmeFi platform.

    event LendmeFiFeeChanged(uint256 newFee);

    constructor(address _weth, address _usdc) Ownable(msg.sender) {
        erc20whitelist[_weth] = true;
        erc20whitelist[_usdc] = true;
    }

    function setLendmefiFee(uint256 _fee) external onlyOwner {
        lendmeFiFeeBasisPoint = _fee;
        emit LendmeFiFeeChanged(_fee);
    }

    function setERC20Whitelist(
        address _token,
        bool _status
    ) external onlyOwner {
        erc20whitelist[_token] = _status;
    }

    function setERC721Whitelist(
        address _token,
        bool _status
    ) external onlyOwner {
        erc721whitelist[_token] = _status;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
