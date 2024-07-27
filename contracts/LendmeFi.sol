// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721Holder} from "./core/ERC721Holder.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {IERC721} from "./interfaces/IERC721.sol";
import {SafeERC20} from "./library/SafeERC20.sol";
import {Settings} from "./core/Settings.sol";
import {EIP712SignMessage} from "./core/EIP712SignMessage.sol";
import {Calculator} from "./core/Calculator.sol";

contract LendmeFi is Calculator, Settings, EIP712SignMessage, ERC721Holder {
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
        uint256 interestFee;
        uint256 lendmeFiFee;
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
        uint256 interestFee,
        uint256 lendmeFiFee,
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
        uint256 interestFee,
        uint256 lendmeFiFee,
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
        uint256 interestFee,
        uint256 lendmeFiFee,
        uint256 loanStartTime,
        uint256 loanDuration
    );

    mapping(uint256 => Loan) public loans;

    uint256 public numberofTotalLoans = 0;

    uint256 public numberofActiveLoans = 0;

    constructor(address _weth, address _usdc) Settings(_weth, _usdc) {}

    // Prevents receiving ether
    receive() external payable {
        revert();
    }

    // Prevents receiving ether
    fallback() external payable {
        revert();
    }

    // msg.sender is the lender
    function startLoanDirectly(
        address _borrowerAddress,
        uint256 _borrowerNonce,
        uint256 _lenderNonce,
        address _nftCollateralAddress,
        uint256 _nftTokenId,
        address _loanTokenAddress,
        uint256 _loanAmount,
        uint256 _interestFee,
        uint256 _loanDuration,
        bytes memory _borrowerSignature
    ) external whenNotPaused nonReentrant {
        uint256 _lendmeFiFee = calculateLendmeFiFee(
            _loanAmount,
            lendmeFiFeeBasisPoint
        );
        Loan memory loan = Loan({
            loanId: numberofTotalLoans,
            borrowerAddress: _borrowerAddress,
            lenderAddress: msg.sender,
            nftCollateralAddress: _nftCollateralAddress,
            nftTokenId: _nftTokenId,
            loanTokenAddress: _loanTokenAddress,
            loanAmount: _loanAmount,
            interestFee: _interestFee,
            lendmeFiFee: _lendmeFiFee,
            loanStartTime: block.timestamp,
            loanDuration: _loanDuration,
            status: LoanStatus.ACTIVE
        });

        require(loan.loanDuration > 0, "Invalid loan duration");
        require(loan.loanAmount > 0, "Invalid loan amount");
        require(loan.interestFee > 0, "Invalid interest fee");

        require(erc20whitelist[loan.loanTokenAddress], "Token not supported");
        require(
            erc721whitelist[loan.nftCollateralAddress],
            "NFT not supported"
        );

        _markNonceAsUsed(loan.borrowerAddress, _borrowerNonce);
        _markNonceAsUsed(loan.lenderAddress, _lenderNonce);

        require(
            verifyBorrowerSignature(
                BorrowerData(
                    loan.borrowerAddress,
                    _borrowerNonce,
                    loan.nftCollateralAddress,
                    loan.nftTokenId,
                    loan.loanTokenAddress,
                    loan.loanAmount,
                    loan.interestFee,
                    loan.loanDuration
                ),
                _borrowerSignature
            ),
            "Invalid borrower signature"
        );

        loans[numberofTotalLoans] = loan;

        numberofTotalLoans++;

        numberofActiveLoans++;

        IERC721(loan.nftCollateralAddress).safeTransferFrom(
            loan.borrowerAddress,
            address(this),
            loan.nftTokenId
        );

        IERC20(loan.loanTokenAddress).safeTransferFrom(
            msg.sender,
            loan.borrowerAddress,
            loan.loanAmount
        );

        emit LoanStarted(
            loan.loanId,
            loan.borrowerAddress,
            loan.lenderAddress,
            loan.nftCollateralAddress,
            loan.nftTokenId,
            loan.loanTokenAddress,
            loan.loanAmount,
            loan.interestFee,
            loan.lendmeFiFee,
            loan.loanStartTime,
            loan.loanDuration
        );
    }

    // msg.sender is the borrower
    function startLoanByOffer(
        uint256 _borrowerNonce,
        address _lenderAddress,
        uint256 _lenderNonce,
        address _nftCollateralAddress,
        uint256 _nftTokenId,
        address _loanTokenAddress,
        uint256 _loanAmount,
        uint256 _interestFee,
        uint256 _loanDuration,
        bytes memory _borrowerSignature,
        bytes memory _lenderSignature
    ) external whenNotPaused nonReentrant {
        uint256 _lendmeFiFee = calculateLendmeFiFee(
            _loanAmount,
            lendmeFiFeeBasisPoint
        );
        Loan memory loan = Loan({
            loanId: numberofTotalLoans,
            borrowerAddress: msg.sender,
            lenderAddress: _lenderAddress,
            nftCollateralAddress: _nftCollateralAddress,
            nftTokenId: _nftTokenId,
            loanTokenAddress: _loanTokenAddress,
            loanAmount: _loanAmount,
            interestFee: _interestFee,
            lendmeFiFee: _lendmeFiFee,
            loanStartTime: block.timestamp,
            loanDuration: _loanDuration,
            status: LoanStatus.ACTIVE
        });

        require(loan.loanDuration > 0, "Invalid loan duration");
        require(loan.loanAmount > 0, "Invalid loan amount");
        require(loan.interestFee > 0, "Invalid interest fee");

        require(erc20whitelist[loan.loanTokenAddress], "Token not supported");
        require(
            erc721whitelist[loan.nftCollateralAddress],
            "NFT not supported"
        );

        _markNonceAsUsed(loan.borrowerAddress, _borrowerNonce);
        _markNonceAsUsed(loan.lenderAddress, _lenderNonce);

        require(
            verifyBorrowerSignature(
                BorrowerData(
                    loan.borrowerAddress,
                    _borrowerNonce,
                    loan.nftCollateralAddress,
                    loan.nftTokenId,
                    loan.loanTokenAddress,
                    loan.loanAmount,
                    loan.interestFee,
                    loan.loanDuration
                ),
                _borrowerSignature
            ),
            "Invalid borrower signature"
        );

        require(
            verifyLenderSignature(
                LenderData(
                    loan.lenderAddress,
                    _lenderNonce,
                    loan.nftCollateralAddress,
                    loan.nftTokenId,
                    loan.loanTokenAddress,
                    loan.loanAmount,
                    loan.interestFee,
                    loan.loanDuration
                ),
                _lenderSignature
            ),
            "Invalid lender signature"
        );

        loans[numberofTotalLoans] = loan;

        numberofTotalLoans++;

        numberofActiveLoans++;

        IERC721(loan.nftCollateralAddress).safeTransferFrom(
            loan.borrowerAddress,
            address(this),
            loan.nftTokenId
        );

        IERC20(loan.loanTokenAddress).safeTransferFrom(
            loan.lenderAddress,
            loan.borrowerAddress,
            loan.loanAmount
        );

        emit LoanStarted(
            loan.loanId,
            loan.borrowerAddress,
            loan.lenderAddress,
            loan.nftCollateralAddress,
            loan.nftTokenId,
            loan.loanTokenAddress,
            loan.loanAmount,
            loan.interestFee,
            loan.lendmeFiFee,
            loan.loanStartTime,
            loan.loanDuration
        );
    }

    function repayLoan(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];

        require(loan.status == LoanStatus.ACTIVE, "Loan is not active");

        require(
            loan.borrowerAddress == msg.sender,
            "Only borrower can repay the loan"
        );

        require(
            !isLoanTimeOver(loan.loanStartTime, loan.loanDuration),
            "Loan time is over"
        );

        uint256 repaymentAmount = calculateRepaymentAmount(
            loan.loanAmount,
            loan.interestFee
        );

        IERC20(loan.loanTokenAddress).safeTransferFrom(
            loan.borrowerAddress,
            loan.lenderAddress,
            repaymentAmount
        );

        IERC20(loan.loanTokenAddress).safeTransferFrom(
            loan.borrowerAddress,
            owner(),
            loan.lendmeFiFee
        );

        IERC721(loan.nftCollateralAddress).safeTransferFrom(
            address(this),
            loan.borrowerAddress,
            loan.nftTokenId
        );

        loan.status = LoanStatus.REPAYED;

        numberofActiveLoans--;

        emit LoanRepaid(
            loan.loanId,
            loan.borrowerAddress,
            loan.lenderAddress,
            loan.nftCollateralAddress,
            loan.nftTokenId,
            loan.loanTokenAddress,
            loan.loanAmount,
            loan.interestFee,
            loan.lendmeFiFee,
            loan.loanStartTime,
            loan.loanDuration
        );

        delete loans[_loanId];
    }

    function liquidateLoan(uint256 _loanId) external nonReentrant {
        Loan storage loan = loans[_loanId];

        require(loan.status == LoanStatus.ACTIVE, "Loan is not active");

        require(
            loan.lenderAddress == msg.sender,
            "Only lender can liquidate the loan"
        );

        require(
            isLoanTimeOver(loan.loanStartTime, loan.loanDuration),
            "Loan time is not over"
        );

        IERC721(loan.nftCollateralAddress).safeTransferFrom(
            address(this),
            loan.lenderAddress,
            loan.nftTokenId
        );

        loan.status = LoanStatus.LIQUIDATED;

        numberofActiveLoans--;

        emit LoanLiquidated(
            loan.loanId,
            loan.borrowerAddress,
            loan.lenderAddress,
            loan.nftCollateralAddress,
            loan.nftTokenId,
            loan.loanTokenAddress,
            loan.loanAmount,
            loan.interestFee,
            loan.lendmeFiFee,
            loan.loanStartTime,
            loan.loanDuration
        );

        delete loans[_loanId];
    }

    function cancelSignatureBeforeLoanStart(uint256 _nonce) external {
        _markNonceAsUsed(msg.sender, _nonce);
    }
}
