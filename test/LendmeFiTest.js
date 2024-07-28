const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendmeFi", function () {
    let eip712SignMessage, calculator, settings, lendmeFi;
    let owner, borrower, lender, weth, usdc, nft;


    beforeEach(async function () {
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

        // Deploy EIP712SignMessage
        const EIP712SignMessage = await ethers.getContractFactory("EIP712SignMessage");
        eip712SignMessage = await EIP712SignMessage.deploy();
        await eip712SignMessage.waitForDeployment();

        // Deploy Calculator
        const Calculator = await ethers.getContractFactory("Calculator");
        calculator = await Calculator.deploy();
        await calculator.waitForDeployment();

        // // Deploy Settings
        // const Settings = await ethers.getContractFactory("Settings");
        // settings = await Settings.deploy(await weth.getAddress(), await usdc.getAddress());
        // await settings.waitForDeployment();

        // console.log(weth.target);
        // console.log(await usdc.getAddress());

        // Deploy LendmeFi
        const LendmeFi = await ethers.getContractFactory("LendmeFi");
        lendmeFi = await LendmeFi.deploy(await weth.getAddress(), await usdc.getAddress());
        await lendmeFi.waitForDeployment();

        //console.log(await lendmeFi.erc721whitelist(nft.getAddress()));

        await lendmeFi.connect(owner).setERC721Whitelist(nft.getAddress(), true);

    });




    async function signLenderData(lender, eip712SignMessage, lenderData) {
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
                { name: "interestFee", type: "uint256" },
                { name: "loanDuration", type: "uint256" }
            ]
        };

        return await lender.signTypedData(domain, types, lenderData);
    }


    // it("should verify borrower signature", async function () {
    //     let borrowerNonce = 0;
    //     const nftCollateralAddress = await nft.getAddress();
    //     const nftTokenId = 1;
    //     const loanTokenAddress = await weth.getAddress();
    //     const loanAmount = ethers.parseEther("1");
    //     const interestFee = ethers.parseEther("0.1");
    //     const loanDuration = 3600;

    //     // Borrower signs the loan data
    //     const borrowerData = {
    //         borrowerAddress: await borrower.getAddress(),
    //         borrowerNonce: borrowerNonce,
    //         nftCollateralAddress: nftCollateralAddress,
    //         nftTokenId: nftTokenId,
    //         loanTokenAddress: loanTokenAddress,
    //         loanAmount: loanAmount,
    //         interestFee: interestFee,
    //         loanDuration: loanDuration
    //     };

    //     const signature = await signBorrowerData(borrower, eip712SignMessage, borrowerData);
    //     const isValid = await eip712SignMessage.verifyBorrowerSignature(borrowerData, signature);
    //     expect(isValid).to.be.true;
    // });

    it("should start a loan directly", async function () {

        async function signBorrowerData(borrower, eip712SignMessage, borrowerData) {

            const domain = {
                name: "LendmeFi",
                version: "1",
                chainId: 31337,
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
                    { name: "interestFee", type: "uint256" },
                    { name: "loanDuration", type: "uint256" }
                ]
            };

            return await borrower.signTypedData(domain, types, borrowerData);
        }

        const borrowerAddress = await borrower.getAddress();
        let borrowerNonce = 0;
        let lenderNonce = 0;
        const nftCollateralAddress = await nft.getAddress();
        const nftTokenId = 1;
        const loanTokenAddress = await weth.getAddress();
        const loanAmount = ethers.parseEther("1");
        const interestFee = ethers.parseEther("0.1");
        const loanDuration = 3600;

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

        console.log(borrowerData);


        const borrowerSignature = await signBorrowerData(borrower, eip712SignMessage, borrowerData);
        const isValid = await eip712SignMessage.verifyBorrowerSignature(borrowerData, borrowerSignature);
        console.log(isValid);

        // Start the loan directly
        await lendmeFi.connect(lender).startLoanDirectly(
            borrowerData,
            lenderNonce,
            borrowerSignature
        );

        // Check loan details
        const loan = await lendmeFi.loans(0);
        expect(loan.borrowerAddress).to.equal(await borrower.getAddress());
        expect(loan.lenderAddress).to.equal(await lender.getAddress());
        expect(loan.loanAmount).to.equal(loanAmount);
        expect(loan.interestFee).to.equal(interestFee);
    });
});
