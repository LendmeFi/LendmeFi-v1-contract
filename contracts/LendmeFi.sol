// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721Holder} from "./core/ERC721Holder.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {IERC721} from "./interfaces/IERC721.sol";
import {SafeERC20} from "./library/SafeERC20.sol";
import {Settings} from "./core/Settings.sol";
import {EIP712SignMessage} from "./core/EIP712SignMessage.sol";

contract LendmeFi is ERC721Holder, Settings, EIP712SignMessage {
    using SafeERC20 for IERC20;

    constructor(address _weth, address _usdc) Settings(_weth, _usdc) {}
}
