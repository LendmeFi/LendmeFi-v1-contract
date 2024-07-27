const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EIP712SignMessage", function () {
    let EIP712SignMessage, eip712SignMessage;
    let owner, borrower, lender;

    console.log(ethers.version);
    const addresZero = "0x0000000000000000000000000000000000000000";
    let borrowerNonce =
    beforeEach(async function () {
        [owner, borrower, lender] = await ethers.getSigners();
        const EIP712SignMessageFactory = await ethers.getContractFactory("EIP712SignMessage");
        eip712SignMessage = await EIP712SignMessageFactory.deploy();
        await eip712SignMessage.waitForDeployment();
        console.log("EIP712SignMessage deployed to:", eip712SignMessage.target);
        console.log(borrower.address);


    });

    it("should verify borrower signature", async function () {
        borrowerNonce = await eip712SignMessage.nonces(borrower.address);
        const borrowerData = {
            borrowerAddress: borrower.address,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: addresZero,
            nftTokenId: 1,
            loanTokenAddress: addresZero,
            loanAmount: ethers.parseUnits("100", 18),
            repaymentAmount: ethers.parseUnits("110", 18),
            loanDuration: 3600
        };

        const domain = {
            name: "LendmeFi",
            version: "1",
            chainId: (await ethers.provider.getNetwork()).chainId,
            verifyingContract: eip712SignMessage.target
        };

        const types = {
            BorrowerData: [
                { name: "borrowerAddress", type: "address" },
                { name: "borrowerNonce", type: "uint256" },
                { name: "nftCollateralAddress", type: "address" },
                { name: "nftTokenId", type: "uint256" },
                { name: "loanTokenAddress", type: "address" },
                { name: "loanAmount", type: "uint256" },
                { name: "repaymentAmount", type: "uint256" },
                { name: "loanDuration", type: "uint256" }
            ]
        };

        const signature = await borrower.signTypedData(domain, types, borrowerData);
        console.log("Generated signature:", signature);
        const isValid = await eip712SignMessage.verifyBorrowerSignature(borrowerData, signature);
        console.log("Signature valid:", isValid);
        expect(isValid).to.be.true;
    });

    it("should verify lender signature", async function () {
        const lenderData = {
            lenderAddress: lender.address,
            lenderNonce: await eip712SignMessage.nonces(lender.address),
            nftCollateralAddress: addresZero,
            nftTokenId: 1,
            loanTokenAddress: addresZero,
            loanAmount: ethers.parseUnits("100", 18),
            repaymentAmount: ethers.parseUnits("110", 18),
            loanDuration: 3600
        };

        const domain = {
            name: "LendmeFi",
            version: "1",
            chainId: (await ethers.provider.getNetwork()).chainId,
            verifyingContract: eip712SignMessage.target
        };

        const types = {
            LenderData: [
                { name: "lenderAddress", type: "address" },
                { name: "lenderNonce", type: "uint256" },
                { name: "nftCollateralAddress", type: "address" },
                { name: "nftTokenId", type: "uint256" },
                { name: "loanTokenAddress", type: "address" },
                { name: "loanAmount", type: "uint256" },
                { name: "repaymentAmount", type: "uint256" },
                { name: "loanDuration", type: "uint256" }
            ]
        };

        const signature = await lender.signTypedData(domain, types, lenderData);
        const isValid = await eip712SignMessage.verifyLenderSignature(lenderData, signature);
        expect(isValid).to.be.true;
    });

    it("should execute borrower transaction", async function () {
        const borrowerData = {
            borrowerAddress: borrower.address,
            borrowerNonce: await eip712SignMessage.nonces(borrower.address),
            nftCollateralAddress: addresZero,
            nftTokenId: 1,
            loanTokenAddress: addresZero,
            loanAmount: ethers.parseUnits("100", 18),
            repaymentAmount: ethers.parseUnits("110", 18),
            loanDuration: 3600
        };

        const domain = {
            name: "LendmeFi",
            version: "1",
            chainId: (await ethers.provider.getNetwork()).chainId,
            verifyingContract: eip712SignMessage.target
        };

        const types = {
            BorrowerData: [
                { name: "borrowerAddress", type: "address" },
                { name: "borrowerNonce", type: "uint256" },
                { name: "nftCollateralAddress", type: "address" },
                { name: "nftTokenId", type: "uint256" },
                { name: "loanTokenAddress", type: "address" },
                { name: "loanAmount", type: "uint256" },
                { name: "repaymentAmount", type: "uint256" },
                { name: "loanDuration", type: "uint256" }
            ]
        };

        const signature = await borrower.signTypedData(domain, types, borrowerData);
        await expect(eip712SignMessage.executeBorrowerTransaction(borrowerData, signature))
            .to.emit(eip712SignMessage, "NonceUsed")
            .withArgs(borrower.address, borrowerData.borrowerNonce);
    });

    it("should execute lender transaction", async function () {
        const lenderData = {
            lenderAddress: lender.address,
            lenderNonce: await eip712SignMessage.nonces(lender.address),
            nftCollateralAddress: addresZero,
            nftTokenId: 1,
            loanTokenAddress: addresZero,
            loanAmount: ethers.parseUnits("100", 18),
            repaymentAmount: ethers.parseUnits("110", 18),
            loanDuration: 3600
        };

        const domain = {
            name: "LendmeFi",
            version: "1",
            chainId: (await ethers.provider.getNetwork()).chainId,
            verifyingContract: eip712SignMessage.target
        };

        const types = {
            LenderData: [
                { name: "lenderAddress", type: "address" },
                { name: "lenderNonce", type: "uint256" },
                { name: "nftCollateralAddress", type: "address" },
                { name: "nftTokenId", type: "uint256" },
                { name: "loanTokenAddress", type: "address" },
                { name: "loanAmount", type: "uint256" },
                { name: "repaymentAmount", type: "uint256" },
                { name: "loanDuration", type: "uint256" }
            ]
        };

        const signature = await lender.signTypedData(domain, types, lenderData);
        await expect(eip712SignMessage.executeLenderTransaction(lenderData, signature))
            .to.emit(eip712SignMessage, "NonceUsed")
            .withArgs(lender.address, lenderData.lenderNonce);
    });
});
