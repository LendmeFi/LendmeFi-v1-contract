const { expect } = require("chai");
const { ethers } = require("hardhat");

// To run the tests, use the following command: npx hardhat test test/advancedTest.js

describe("LendmeFi", function () {
    let eip712SignMessage, calculator, settings, lendmeFi;
    let owner, borrower, lender, weth, usdc, nft;
    let borrowerAddress, lenderAddress, borrowerNonce, lenderNonce, nftCollateralAddress, nftTokenId, loanTokenAddress;

    beforeEach(async function () {
        console.log(ethers.version);
        [owner, borrower, lender, weth, usdc, nft] = await ethers.getSigners();

        // Deploy WETH and USDC mock tokens
        const WETH = await ethers.getContractFactory("WETH");
        weth = await WETH.deploy();
        await weth.waitForDeployment();

        const USDC = await ethers.getContractFactory("USDC");
        usdc = await USDC.deploy();
        await usdc.waitForDeployment();

        // Deploy NFT
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy();
        await nft.waitForDeployment();

        // Deploy LendmeFi
        const LendmeFi = await ethers.getContractFactory("LendmeFi");
        lendmeFi = await LendmeFi.deploy(await weth.getAddress(), await usdc.getAddress());
        await lendmeFi.waitForDeployment();

        await lendmeFi.connect(owner).setERC721Whitelist(nft.getAddress(), true);

        await nft.connect(borrower).safeMint(await borrower.getAddress(), 0);

        const halfAmount = ethers.parseUnits("500000", 18);

        await nft.connect(borrower).setApprovalForAll(await lendmeFi.getAddress(), true);
        await usdc.connect(owner).transfer(await lender.getAddress(), halfAmount);
        await usdc.connect(owner).transfer(await borrower.getAddress(), halfAmount);
        console.log("Owner USDC balance: ", (await usdc.balanceOf(await owner.getAddress())).toString());
        await usdc.connect(lender).approve(await lendmeFi.getAddress(), ethers.parseEther("1000000"));
        await usdc.connect(borrower).approve(await lendmeFi.getAddress(), ethers.parseEther("1000000"));

        borrowerAddress = await borrower.getAddress();
        lenderAddress = await lender.getAddress();
        borrowerNonce = 1;
        lenderNonce = 1;
        nftCollateralAddress = await nft.getAddress();
        nftTokenId = 0;
        loanTokenAddress = await usdc.getAddress();
    });

    async function signBorrowerData(borrower, borrowerData) {
        const domain = {
            name: "LendmeFi",
            version: "1",
            chainId: 31337, // hardhat chain id
            verifyingContract: lendmeFi.target
        };

        const types = {
            BorrowerData: [
                { name: "borrowerAddress", type: "address" },
                { name: "borrowerNonce", type: "uint256" },
                { name: "nftCollateralAddress", type: "address" },
                { name: "nftTokenId", type: "uint256" },
                { name: "loanTokenAddress", type: "address" },
                { name: "loanAmount", type: "uint256" },
                { name: "interestFee", type: "uint256" },
                { name: "loanDuration", type: "uint256" }
            ]
        };

        return await borrower.signTypedData(domain, types, borrowerData);
    }

    async function signLenderData(lender, lenderData) {
        const domain = {
            name: "LendmeFi",
            version: "1",
            chainId: 31337, // hardhat chain id
            verifyingContract: lendmeFi.target
        };

        const types = {
            LenderData: [
                { name: "lenderAddress", type: "address" },
                { name: "lenderNonce", type: "uint256" },
                { name: "nftCollateralAddress", type: "address" },
                { name: "nftTokenId", type: "uint256" },
                { name: "loanTokenAddress", type: "address" },
                { name: "loanAmount", type: "uint256" },
                { name: "interestFee", type: "uint256" },
                { name: "loanDuration", type: "uint256" }
            ]
        };

        return await lender.signTypedData(domain, types, lenderData);
    }

    it("should start a loan directly", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18));
        let interestFee = 1000;
        let loanDuration = 3600;

        // Borrower signs the loan data
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        const tx = await lendmeFi.connect(lender).startLoanDirectly(
            borrowerAddress,
            borrowerNonce,
            lenderNonce,
            nftCollateralAddress,
            nftTokenId,
            loanTokenAddress,
            loanAmount,
            interestFee,
            loanDuration,
            borrowerSignature,
        );

        // Check loan started event
        await expect(tx).to.emit(lendmeFi, "LoanStarted");

        // Check loan details
        const loan = await lendmeFi.loans(0);
        expect(loan.borrowerAddress).to.equal(await borrower.getAddress());
        expect(loan.lenderAddress).to.equal(await lender.getAddress());
        expect(loan.loanAmount).to.equal(loanAmount);
        expect(loan.interestFee).to.equal(interestFee);
    });

    it("should repay a loan", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18));
        let interestFee = 1000;
        let loanDuration = 3600;

        // Borrower signs the loan data
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        await lendmeFi.connect(lender).startLoanDirectly(
            borrowerAddress,
            borrowerNonce,
            lenderNonce,
            nftCollateralAddress,
            nftTokenId,
            loanTokenAddress,
            loanAmount,
            interestFee,
            loanDuration,
            borrowerSignature,
        );


        const tx = await lendmeFi.connect(borrower).repayLoan(0);
        await expect(tx).to.emit(lendmeFi, "LoanRepaid");

    });

    it("should liquidate a loan", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18));
        let interestFee = 1000;
        let loanDuration = 1; // Short duration for test

        // Borrower signs the loan data
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        await lendmeFi.connect(lender).startLoanDirectly(
            borrowerAddress,
            borrowerNonce,
            lenderNonce,
            nftCollateralAddress,
            nftTokenId,
            loanTokenAddress,
            loanAmount,
            interestFee,
            loanDuration,
            borrowerSignature,
        );

        // Wait for loan duration to pass
        await new Promise(resolve => setTimeout(resolve, 2000));
        const tx = await lendmeFi.connect(lender).liquidateLoan(0);
        await expect(tx).to.emit(lendmeFi, "LoanLiquidated");

    });

    it("should cancel a borrower's signature", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18));
        let interestFee = 1000;
        let loanDuration = 3600;

        // Borrower signs the loan data
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        await lendmeFi.connect(borrower).cancelSignatureBeforeLoanStart(borrowerNonce);

        await expect(
            lendmeFi.connect(lender).startLoanDirectly(
                borrowerAddress,
                borrowerNonce,
                lenderNonce,
                nftCollateralAddress,
                nftTokenId,
                loanTokenAddress,
                loanAmount,
                interestFee,
                loanDuration,
                borrowerSignature,
            )
        ).to.be.revertedWith("Nonce already used");
    });

    it("should fail to start a loan with an invalid borrower signature", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18));
        let interestFee = 1000;
        let loanDuration = 3600;

        // Borrower signs the loan data with an incorrect nonce
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce + 1, // Incorrect nonce
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        await expect(
            lendmeFi.connect(lender).startLoanDirectly(
                borrowerAddress,
                borrowerNonce,
                lenderNonce,
                nftCollateralAddress,
                nftTokenId,
                loanTokenAddress,
                loanAmount,
                interestFee,
                loanDuration,
                borrowerSignature,
            )
        ).to.be.revertedWith("Invalid borrower signature");
    });

    it("should fail to repay a loan by an unauthorized user", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18));
        let interestFee = 1000;
        let loanDuration = 3600;

        // Borrower signs the loan data
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        await lendmeFi.connect(lender).startLoanDirectly(
            borrowerAddress,
            borrowerNonce,
            lenderNonce,
            nftCollateralAddress,
            nftTokenId,
            loanTokenAddress,
            loanAmount,
            interestFee,
            loanDuration,
            borrowerSignature,
        );

        await expect(
            lendmeFi.connect(lender).repayLoan(0) // lender trying to repay
        ).to.be.revertedWith("Only borrower can repay the loan");
    });

    it("should verify loan details after repayment and ensure loan data is reset", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18));
        let interestFee = 1000;
        let loanDuration = 3600;

        // Borrower signs the loan data
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        await lendmeFi.connect(lender).startLoanDirectly(
            borrowerAddress,
            borrowerNonce,
            lenderNonce,
            nftCollateralAddress,
            nftTokenId,
            loanTokenAddress,
            loanAmount,
            interestFee,
            loanDuration,
            borrowerSignature,
        );

        await lendmeFi.connect(borrower).repayLoan(0);

        const loan = await lendmeFi.loans(0);
        expect(loan.borrowerAddress).to.equal(ethers.ZeroAddress);
        expect(loan.lenderAddress).to.equal(ethers.ZeroAddress);
        expect(loan.loanAmount).to.equal(0);
        expect(loan.interestFee).to.equal(0);
    });

    it("should verify NFT ownership after liquidation", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18));
        let interestFee = 1000;
        let loanDuration = 1; // Short duration for test

        // Borrower signs the loan data
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        await lendmeFi.connect(lender).startLoanDirectly(
            borrowerAddress,
            borrowerNonce,
            lenderNonce,
            nftCollateralAddress,
            nftTokenId,
            loanTokenAddress,
            loanAmount,
            interestFee,
            loanDuration,
            borrowerSignature,
        );

        // Wait for loan duration to pass
        await new Promise(resolve => setTimeout(resolve, 2000));
        await lendmeFi.connect(lender).liquidateLoan(0);

        const newOwner = await nft.ownerOf(nftTokenId);
        expect(newOwner).to.equal(lenderAddress);
    });

    it("should allow the same borrower to start and repay multiple loans", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18));
        let interestFee = 1000;
        let loanDuration = 3600;

        // Borrower signs the first loan data
        let borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        let borrowerSignature = await signBorrowerData(borrower, borrowerData);

        await lendmeFi.connect(lender).startLoanDirectly(
            borrowerAddress,
            borrowerNonce,
            lenderNonce,
            nftCollateralAddress,
            nftTokenId,
            loanTokenAddress,
            loanAmount,
            interestFee,
            loanDuration,
            borrowerSignature,
        );

        // Borrower signs the second loan data
        borrowerNonce++;
        borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId + 1, // different NFT token
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        borrowerSignature = await signBorrowerData(borrower, borrowerData);

        await nft.connect(borrower).safeMint(await borrower.getAddress(), nftTokenId + 1);
        await nft.connect(borrower).setApprovalForAll(await lendmeFi.getAddress(), true);

        await lendmeFi.connect(lender).startLoanDirectly(
            borrowerAddress,
            borrowerNonce,
            lenderNonce + 1,
            nftCollateralAddress,
            nftTokenId + 1,
            loanTokenAddress,
            loanAmount,
            interestFee,
            loanDuration,
            borrowerSignature,
        );

        const firstLoanRepayment = await lendmeFi.connect(borrower).repayLoan(0);
        const secondLoandRepayment = await lendmeFi.connect(borrower).repayLoan(1);
        expect(firstLoanRepayment).to.emit(lendmeFi, "LoanRepaid");
        expect(secondLoandRepayment).to.emit(lendmeFi, "LoanRepaid");
    });

    it("should fail to repay an already repaid loan", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18));
        let interestFee = 1000;
        let loanDuration = 3600;

        // Borrower signs the loan data
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        await lendmeFi.connect(lender).startLoanDirectly(
            borrowerAddress,
            borrowerNonce,
            lenderNonce,
            nftCollateralAddress,
            nftTokenId,
            loanTokenAddress,
            loanAmount,
            interestFee,
            loanDuration,
            borrowerSignature,
        );

        await lendmeFi.connect(borrower).repayLoan(0);

        await expect(
            lendmeFi.connect(borrower).repayLoan(0)
        ).to.be.revertedWith("Loan is not active");
    });

    it("should fail to liquidate a loan before duration ends", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18));
        let interestFee = 1000;
        let loanDuration = 3600;

        // Borrower signs the loan data
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        await lendmeFi.connect(lender).startLoanDirectly(
            borrowerAddress,
            borrowerNonce,
            lenderNonce,
            nftCollateralAddress,
            nftTokenId,
            loanTokenAddress,
            loanAmount,
            interestFee,
            loanDuration,
            borrowerSignature,
        );

        await expect(
            lendmeFi.connect(lender).liquidateLoan(0)
        ).to.be.revertedWith("Loan time is not over");
    });

    it("should fail to liquidate a loan that is already repaid", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18));
        let interestFee = 1000;
        let loanDuration = 3600;

        // Borrower signs the loan data
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        await lendmeFi.connect(lender).startLoanDirectly(
            borrowerAddress,
            borrowerNonce,
            lenderNonce,
            nftCollateralAddress,
            nftTokenId,
            loanTokenAddress,
            loanAmount,
            interestFee,
            loanDuration,
            borrowerSignature,
        );

        await lendmeFi.connect(borrower).repayLoan(0);

        await expect(
            lendmeFi.connect(lender).liquidateLoan(0)
        ).to.be.revertedWith("Loan is not active");
    });

    it("should start a loan with lender signature by offer", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18));
        let interestFee = 1000;
        let loanDuration = 3600;

        // Borrower signs the loan data
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        // Lender signs the data with incorrect nonce
        const lenderData = {
            lenderAddress: lenderAddress,
            lenderNonce: lenderNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const lenderSignature = await signLenderData(lender, lenderData);

        await expect(
            lendmeFi.connect(borrower).startLoanByOffer(
                borrowerNonce,
                lenderAddress,
                lenderNonce,
                nftCollateralAddress,
                nftTokenId,
                loanTokenAddress,
                loanAmount,
                interestFee,
                loanDuration,
                borrowerSignature,
                lenderSignature
            )
        ).to.emit(lendmeFi, "LoanStarted");
    });

    it("should fail to start a loan with incorrect lender signature", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18));
        let interestFee = 1000;
        let loanDuration = 3600;

        // Borrower signs the loan data
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        // Lender signs the data with incorrect nonce
        const lenderData = {
            lenderAddress: lenderAddress,
            lenderNonce: lenderNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const lenderSignature = await signLenderData(lender, lenderData);

        await expect(
            lendmeFi.connect(borrower).startLoanByOffer(
                borrowerNonce,
                lenderAddress,
                lenderNonce + 1, // Incorrect nonce
                nftCollateralAddress,
                nftTokenId,
                loanTokenAddress,
                loanAmount,
                interestFee,
                loanDuration,
                borrowerSignature,
                lenderSignature
            )
        ).to.be.revertedWith("Invalid lender signature");
    });

    it("should fail to start a loan when lender has insufficient funds", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("1000000", 18)); // Large amount for test
        let interestFee = 1000;
        let loanDuration = 3600;

        // Borrower signs the loan data
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        await expect(
            lendmeFi.connect(lender).startLoanDirectly(
                borrowerAddress,
                borrowerNonce,
                lenderNonce,
                nftCollateralAddress,
                nftTokenId,
                loanTokenAddress,
                loanAmount,
                interestFee,
                loanDuration,
                borrowerSignature,
            )
        ).to.be.reverted;
    });

    it("should fail to start a loan when lender 2 times start the loan", async function () {
        let loanAmount = ethers.toBigInt(ethers.parseUnits("100", 18));
        let interestFee = 1000;
        let loanDuration = 3600;

        // Borrower signs the loan data
        const borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        const borrowerSignature = await signBorrowerData(borrower, borrowerData);

        await lendmeFi.connect(lender).startLoanDirectly(
            borrowerAddress,
            borrowerNonce,
            lenderNonce,
            nftCollateralAddress,
            nftTokenId,
            loanTokenAddress,
            loanAmount,
            interestFee,
            loanDuration,
            borrowerSignature,
        )

        await expect(
            lendmeFi.connect(lender).startLoanDirectly(
                borrowerAddress,
                borrowerNonce,
                lenderNonce,
                nftCollateralAddress,
                nftTokenId,
                loanTokenAddress,
                loanAmount,
                interestFee,
                loanDuration,
                borrowerSignature,
            )
        ).to.be.revertedWith("Nonce already used");
    });

});