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

    enum LoanStatus {
        ACTIVE,
        REPAYED,
        LIQUIDATED
    }

    struct Loan {
        uint256 loanId;
        address borrowerAddress;
        address lenderAddress;
        address nftCollateralAddress;
        uint256 nftTokenId;
        address loanTokenAddress;
        uint256 loanAmount;
        uint256 repaymentAmount;
        uint256 loanFee;
        uint256 loanStartTime;
        uint256 loanDuration;
        LoanStatus status;
    }

    event LoanStarted(
        uint256 loanId,
        address borrowerAddress,
        address lenderAddress,
        address nftCollateralAddress,
        uint256 nftTokenId,
        address loanTokenAddress,
        uint256 loanAmount,
        uint256 repaymentAmount,
        uint256 loanFee,
        uint256 loanStartTime,
        uint256 loanDuration
    );

    event LoanRepaid(
        uint256 loanId,
        address borrowerAddress,
        address lenderAddress,
        address nftCollateralAddress,
        uint256 nftTokenId,
        address loanTokenAddress,
        uint256 loanAmount,
        uint256 repaymentAmount,
        uint256 loanFee,
        uint256 loanStartTime,
        uint256 loanDuration
    );

    event LoanLiquidated(
        uint256 loanId,
        address borrowerAddress,
        address lenderAddress,
        address nftCollateralAddress,
        uint256 nftTokenId,
        address loanTokenAddress,
        uint256 loanAmount,
        uint256 repaymentAmount,
        uint256 loanFee,
        uint256 loanStartTime,
        uint256 loanDuration
    );

    mapping(uint256 => Loan) public loans;

    uint256 public numberofTotalLoans;

    uint256 public numberofActiveLoans;

    

    constructor(address _weth, address _usdc) Settings(_weth, _usdc) {}
}
