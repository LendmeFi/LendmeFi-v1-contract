const { expect } = require("chai");
const { ethers } = require("hardhat");

// This test is for the Sepolia chain and coded with ethers v5 so be careful when you run it with ethers v6 or hardhat-toolbox": "^3.0.2"
// hardhat-toolbox": "^2.0.2" is compatible with ethers v5. So, you should use ethers v5 to run this test.
// You can run this test with the following command: npx hardhat test test/SepoliaLendmeFi_test.js --network sepolia

describe("LendmeFi", function () {
    let lendmeFi, weth, usdc, eip712SignMessage, calculator;
    let borrower, lender, owner;
    let nft, loanToken;
    let nftTokenId = 0;
    let loanAmount = 1000;
    let interestFee = 100;
    let loanDuration = 10;
    let borrowerAddress, loanTokenAddress, nftCollateralAddress;
    const borrowerNonce = 1;
    const lenderNonce = 1;

    beforeEach(async function () {
        [owner, borrower, lender] = await ethers.getSigners();

        // {
        //     "WETH": "0xEd03bc1E3C552e66635c44aCb87A63e34e293685",
        //     "USDC": "0xc066E282670a6e03346Acb6954e104413f46EBf1",
        //     "NFT": "0x422F3D484532283eEa13f000819367Dcb350BEF2",
        //     "EIP712SignMessage": "0xaa81059698148493795Cdbd21aA4b55C6A380F5B",
        //     "Calculator": "0xa21c943Ae63Efa1C19e7187d44fb9C3b25E8DfEA",
        //     "LendmeFi": "0x2000D3E25D8C1035CEC76a9D3323d4800268163B"
        // }

        weth = await ethers.getContractAt("WETH", "0xEd03bc1E3C552e66635c44aCb87A63e34e293685");
        usdc = await ethers.getContractAt("USDC", "0xc066E282670a6e03346Acb6954e104413f46EBf1");
        nft = await ethers.getContractAt("NFT", "0x422F3D484532283eEa13f000819367Dcb350BEF2");
        eip712SignMessage = await ethers.getContractAt("EIP712SignMessage", "0xaa81059698148493795Cdbd21aA4b55C6A380F5B");
        calculator = await ethers.getContractAt("Calculator", "0xa21c943Ae63Efa1C19e7187d44fb9C3b25E8DfEA");
        lendmeFi = await ethers.getContractAt("LendmeFi", "0x2000D3E25D8C1035CEC76a9D3323d4800268163B");



        // They are already done before.

        await lendmeFi.connect(owner).setERC721Whitelist(nft.address, true);

        await nft.connect(borrower).safeMint(borrower.address, nftTokenId);

        await nft.connect(borrower).setApprovalForAll(lendmeFi.address, true);
        await usdc.connect(owner).transfer(lender.address, loanAmount);
        await usdc.connect(lender).approve(lendmeFi.address, loanAmount);
        await usdc.connect(borrower).approve(lendmeFi.address, loanAmount);

        loanTokenAddress = usdc.address;
        borrowerAddress = borrower.address;
        nftCollateralAddress = nft.address;

        console.log("borrowerAddress: ", borrowerAddress);
        console.log("loanTokenAddress: ", loanTokenAddress);
        console.log("nftCollateralAddress: ", nftCollateralAddress);
        console.log("eip address", eip712SignMessage.address);

        // Borrower data
        this.borrowerData = {
            borrowerAddress: borrowerAddress,
            borrowerNonce: borrowerNonce,
            nftCollateralAddress: nftCollateralAddress,
            nftTokenId: nftTokenId,
            loanTokenAddress: loanTokenAddress,
            loanAmount: loanAmount,
            interestFee: interestFee,
            loanDuration: loanDuration
        };

        Domain
        this.domain = {
            name: "LendmeFi",
            version: "1",
            chainId: 11155111,  // Sepolia chain id
            verifyingContract: lendmeFi.address // be careful with verifyingContract is must be the main contract address.
        };

        Types
        this.types = {
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
    });

    it("Should start a loan directly", async function () {
        const borrowerSignature = await borrower._signTypedData(this.domain, this.types, this.borrowerData);

        const isValid = await eip712SignMessage.verifyBorrowerSignature(this.borrowerData,
            borrowerSignature);

        console.log("Signature valid:", isValid);

        // Log each variable to ensure they are defined
        console.log("borrower.address:", borrower.address);
        console.log("borrowerNonce:", borrowerNonce);
        console.log("lenderNonce:", lenderNonce);
        console.log("nft.address:", nft.address);
        console.log("nftTokenId:", nftTokenId);
        console.log("usdc.address:", usdc.address);
        console.log("loanAmount:", loanAmount);
        console.log("interestFee:", interestFee);
        console.log("loanDuration:", loanDuration);
        console.log("borrowerSignature:", borrowerSignature);

        await lendmeFi.connect(lender).startLoanDirectly(
            borrower.address,
            borrowerNonce,
            lenderNonce,
            nft.address,
            nftTokenId,
            usdc.address,
            loanAmount,
            interestFee,
            loanDuration,
            borrowerSignature
        );

        const loan = await lendmeFi.loans(0);
        expect(loan.borrowerAddress).to.equal(borrower.address);
        expect(loan.lenderAddress).to.equal(lender.address);
        expect(loan.nftCollateralAddress).to.equal(nft.address);
        expect(loan.nftTokenId).to.equal(nftTokenId);
        expect(loan.loanTokenAddress).to.equal(usdc.address);
        expect(loan.loanAmount).to.equal(loanAmount);
        expect(loan.interestFee).to.equal(interestFee);
        expect(loan.status).to.equal(0); // ACTIVE
    });



});
