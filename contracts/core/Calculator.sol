// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Calculator {
    function getCurrentTimestamp() public view returns (uint256) {
        return block.timestamp;
    }

    function calculateLendmeFiFee(
        uint256 loanAmount,
        uint256 feeBasisPoints
    ) public pure returns (uint256) {
        return (loanAmount * feeBasisPoints) / 10000;
    }

    // Calculate the end time of the loan in seconds
    function calculateLoanEndTime(
        uint256 loanStartTime,
        uint256 loanDuration
    ) public pure returns (uint256) {
        return loanStartTime + loanDuration;
    }


    // Check if the loan time is over, true if over, false if not. seconds
    function isLoanTimeOver(
        uint256 loanStartTime,
        uint256 loanDuration
    ) public view returns (bool) {
        return
            block.timestamp >=
            calculateLoanEndTime(loanStartTime, loanDuration);
    }

    // Calculate the repayment amount of the loan in wei
    function calculateRepaymentAmount(
        uint256 loanAmount,
        uint256 interestFee
    ) public pure returns (uint256) {
        return loanAmount + interestFee;
    }

    // Calculate the total repayment amount of the loan in wei
    function calculateTotalRepaymentAmount(
        uint256 loanAmount,
        uint256 interestFee,
        uint256 lendmeFiFeeBasisPoint
    ) public pure returns (uint256) {
        uint256 lendmeFiFee = calculateLendmeFiFee(loanAmount, lendmeFiFeeBasisPoint);
        return loanAmount + interestFee + lendmeFiFee;
    }

}
