# LendmeFi Smart Contracts

## Overview

LendmeFi is a decentralized lending and borrowing platform that leverages blockchain technology to facilitate loans using ERC20 tokens and ERC721 NFTs as collateral. The suite consists of several smart contracts designed to handle various aspects of the lending process, including loan initiation, repayment, liquidation, and platform settings management.

This documentation provides a detailed overview of each contract, including their functions, usage, and integration.

## Contracts

### 1. `Settings`

The `Settings` contract manages the configuration parameters of the LendmeFi platform. It allows the owner to set and modify platform-wide settings such as token whitelists and fee structures.

#### State Variables

- **`erc20whitelist`**: A mapping that tracks which ERC20 tokens are whitelisted. Tokens on this list are allowed for lending and borrowing.
- **`erc721whitelist`**: A mapping that tracks which ERC721 tokens are whitelisted. NFTs on this list can be used as collateral.
- **`lendmeFiFeeBasisPoint`**: The fee for the LendmeFi platform expressed in basis points (1/100th of a percent). The default value is 200 basis points (2%).

#### Events

- **`LendmeFiFeeChanged(uint256 newFee)`**: Emitted when the LendmeFi fee is updated.

#### Functions

- **`constructor(address _weth, address _usdc)`**: Initializes the contract with default whitelisted ERC20 tokens (\_weth and \_usdc).
- **`setLendmefiFee(uint256 _fee)`**: Updates the LendmeFi fee. Only callable by the contract owner.
- **`setERC20Whitelist(address _token, bool _status)`**: Adds or removes an ERC20 token from the whitelist. Only callable by the contract owner.
- **`setERC721Whitelist(address _token, bool _status)`**: Adds or removes an ERC721 token from the whitelist. Only callable by the contract owner.
- **`pause()`**: Pauses the contract, preventing state changes. Only callable by the contract owner.
- **`unpause()`**: Unpauses the contract, allowing state changes. Only callable by the contract owner.

### 2. `Calculator`

The `Calculator` contract provides utility functions for performing various financial calculations related to loans.

#### Functions

- **`getCurrentTimestamp()`**: Returns the current block timestamp.
- **`calculateLendmeFiFee(uint256 loanAmount, uint256 feeBasisPoints)`**: Calculates the LendmeFi fee based on the loan amount and the fee basis points.
- **`calculateLoanEndTime(uint256 loanStartTime, uint256 loanDuration)`**: Computes the end time of a loan based on its start time and duration.
- **`isLoanTimeOver(uint256 loanStartTime, uint256 loanDuration)`**: Checks if the current time is past the end time of the loan.
- **`calculateRepaymentAmount(uint256 loanAmount, uint256 interestFee)`**: Calculates the total repayment amount, including the principal and interest fees, but excluding LendmeFi fees.
- **`calculateTotalRepaymentAmount(uint256 loanAmount, uint256 interestFee, uint256 lendmeFiFeeBasisPoint)`**: Calculates the total repayment amount, including the principal, interest fees, and LendmeFi fees.

### 3. `EIP712SignMessage`

The `EIP712SignMessage` contract provides functionality for handling EIP-712 structured data signatures, which are used for verifying loan agreements and signatures from borrowers and lenders.

#### Structures

- **`BorrowerData`**: Contains information about the borrower and the loan details, including address, nonce, collateral, token address, loan amount, interest fee, and duration.
- **`LenderData`**: Contains information about the lender and the loan details, similar to `BorrowerData`.

#### State Variables

- **`isNonceUsed`**: A mapping that tracks used nonces to prevent replay attacks.

#### Functions

- **`constructor()`**: Initializes the contract with the EIP-712 domain name and version.
- **`getBorrowerMessageHash(BorrowerData memory data)`**: Computes the hash of a borrower's message.
- **`getLenderMessageHash(LenderData memory data)`**: Computes the hash of a lender's message.
- **`verifyBorrowerSignature(BorrowerData memory data, bytes memory signature)`**: Verifies the borrower's signature.
- **`verifyLenderSignature(LenderData memory data, bytes memory signature)`**: Verifies the lender's signature.
- **`_markNonceAsUsed(address user, uint256 nonce)`**: Marks a nonce as used to prevent reuse. Internal function.
- **`_isNonceUsed(address user, uint256 nonce)`**: Checks if a nonce has been used. Internal function.

### 4. `LendmeFi`

The `LendmeFi` contract is the core of the lending platform. It handles loan initiation, repayment, and liquidation.

#### Enums

- **`LoanStatus`**: Defines the status of a loan. Can be `ACTIVE`, `REPAYED`, or `LIQUIDATED`.

#### Structures

- **`Loan`**: Contains detailed information about a loan, including loan ID, borrower and lender addresses, collateral details, loan amount, interest fees, and status.

#### State Variables

- **`loans`**: A mapping of loan IDs to their corresponding `Loan` structure.
- **`loanStatus`**: A mapping of loan IDs to their status (`ACTIVE`, `REPAYED`, `LIQUIDATED`).
- **`numberofTotalLoans`**: Tracks the total number of loans ever created.
- **`numberofActiveLoans`**: Tracks the number of currently active loans.

#### Events

- **`LoanStarted(uint256 loanId, address borrowerAddress, address lenderAddress, address nftCollateralAddress, uint256 nftTokenId, address loanTokenAddress, uint256 loanAmount, uint256 interestFee, uint256 lendmeFiFee, uint256 loanStartTime, uint256 loanDuration)`**: Emitted when a new loan is started.
- **`LoanRepaid(uint256 loanId, address borrowerAddress, address lenderAddress, address nftCollateralAddress, uint256 nftTokenId, address loanTokenAddress, uint256 loanAmount, uint256 interestFee, uint256 lendmeFiFee, uint256 loanStartTime, uint256 loanDuration)`**: Emitted when a loan is repaid.
- **`LoanLiquidated(uint256 loanId, address borrowerAddress, address lenderAddress, address nftCollateralAddress, uint256 nftTokenId, address loanTokenAddress, uint256 loanAmount, uint256 interestFee, uint256 lendmeFiFee, uint256 loanStartTime, uint256 loanDuration)`**: Emitted when a loan is liquidated.

#### Functions

- **`constructor(address _weth, address _usdc)`**: Initializes the contract with default ERC20 tokens.
- **`receive()`**: Reverts any ether sent to this contract.
- **`fallback()`**: Reverts any ether sent to this contract.
- **`startLoanDirectly(address _borrowerAddress, ...)`**: Allows a lender to start a loan directly with a borrower. Requires the lender to provide the loan details and the borrower's signature.
- **`startLoanByOffer(uint256 _borrowerNonce, address _lenderAddress, ...)`**: Allows a borrower to accept a loan offer from a lender. Requires both borrower and lender signatures.
- **`repayLoan(uint256 _loanId)`**: Allows a borrower to repay an active loan. The borrower must repay the principal, interest, and LendmeFi fee.
- **`liquidateLoan(uint256 _loanId)`**: Allows a lender to liquidate a loan if it has not been repaid and the loan period has expired. The lender receives the collateral.
- **`cancelSignatureBeforeLoanStart(uint256 _nonce)`**: Allows a user to cancel a signature before the loan starts, marking the nonce as used.

## Deployment and Usage

### 1. **Setup**

1. **Install Dependencies**: Ensure that you have the necessary Solidity libraries and dependencies installed. This project uses OpenZeppelin contracts and utilities.

2. **Compile Contracts**: Use a Solidity compiler compatible with version `^0.8.20`. For example, you can use Remix, Hardhat, or Truffle for compiling.

3. **Deploy Contracts**:
   - **`Settings`**: Deploy this contract first to configure platform settings.
   - **`EIP712SignMessage`**: Deploy this contract to handle EIP-712 signatures.
   - **`Calculator`**: Deploy this contract if you want standalone calculation functionalities.
   - **`LendmeFi`**: Deploy this contract last, passing the addresses of the `Settings` and `Calculator` contracts if they are separate.

### 2. **Interacting with Contracts**

- **Add Tokens to Whitelist**: Use the `setERC20Whitelist` and `setERC721Whitelist` functions in the `Settings` contract to add ERC20 tokens and ERC721 NFTs to the whitelist.
- **Set Fees**: Update the LendmeFi platform fee using the `setLendmefiFee` function.
- **Start Loans**: Use `startLoanDirectly` or `startLoanByOffer` in the `LendmeFi` contract to initiate loans. Ensure all required signatures are obtained.
- **Repay Loans**: Borrowers can repay loans using the `repayLoan` function.
- **Liquidate Loans**: Lenders can liquidate overdue loans using the `liquidateLoan` function.

### 3. **Security Considerations**

- **Testing**: Thoroughly test all contracts on a testnet before deploying to the mainnet. Use tools like Hardhat or Truffle for testing.
- **Audits**: Conduct security audits to identify and fix vulnerabilities. Pay special attention to reentrancy attacks, signature verification, and proper nonce management.
- **Upgradability**: Consider using a proxy pattern for upgradability if you anticipate making future changes to the contracts.

## License

This code is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

## Contributing

Contributions to the LendmeFi project are welcome. Please follow these guidelines for contributing:

1. **Fork the Repository**: Fork this repository to your own GitHub account.
2. **Make Changes**: Create a new branch for your changes and make your modifications.
3. **Submit Pull Request**: Open a pull request with a detailed description of your changes.

Please adhere to the coding standards and best practices as outlined in the project documentation.

## Contact

For questions, support, or collaboration, please contact us at [emrekaya75@outlook.com](mailto:emrekaya75@outlook.com) or [lendmefi@gmail.com](mailto:lendmefi@gmail.com). You can also follow us on [Twitter](https://x.com/LendmeFi).

---

Thank you for using LendmeFi. We hope you find the platform useful and efficient for your decentralized lending needs.
