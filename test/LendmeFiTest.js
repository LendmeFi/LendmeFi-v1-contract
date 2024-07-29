// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("LendmeFi", function () {
//     let eip712SignMessage, calculator, settings, lendmeFi;
//     let owner, borrower, lender, weth, usdc, nft;


//     beforeEach(async function () {
//         [owner, borrower, lender, weth, usdc, nft] = await ethers.getSigners();



//     });




//     async function signLenderData(lender, eip712SignMessage, lenderData) {
//         const domain = {
//             name: "LendmeFi",
//             version: "1",
//             chainId: (await ethers.provider.getNetwork()).chainId,
//             verifyingContract: eip712SignMessage.target
//         };

//         const types = {
//             LenderData: [
//                 { name: "lenderAddress", type: "address" },
//                 { name: "lenderNonce", type: "uint256" },
//                 { name: "nftCollateralAddress", type: "address" },
//                 { name: "nftTokenId", type: "uint256" },
//                 { name: "loanTokenAddress", type: "address" },
//                 { name: "loanAmount", type: "uint256" },
//                 { name: "interestFee", type: "uint256" },
//                 { name: "loanDuration", type: "uint256" }
//             ]
//         };

//         return await lender.signTypedData(domain, types, lenderData);
//     }


//     // it("should verify borrower signature", async function () {
//     //     let borrowerNonce = 0;
//     //     const nftCollateralAddress = await nft.getAddress();
//     //     const nftTokenId = 1;
//     //     const loanTokenAddress = await weth.getAddress();
//     //     const loanAmount = ethers.parseEther("1");
//     //     const interestFee = ethers.parseEther("0.1");
//     //     const loanDuration = 3600;

//     //     // Borrower signs the loan data
//     //     const borrowerData = {
//     //         borrowerAddress: await borrower.getAddress(),
//     //         borrowerNonce: borrowerNonce,
//     //         nftCollateralAddress: nftCollateralAddress,
//     //         nftTokenId: nftTokenId,
//     //         loanTokenAddress: loanTokenAddress,
//     //         loanAmount: loanAmount,
//     //         interestFee: interestFee,
//     //         loanDuration: loanDuration
//     //     };

//     //     const signature = await signBorrowerData(borrower, eip712SignMessage, borrowerData);
//     //     const isValid = await eip712SignMessage.verifyBorrowerSignature(borrowerData, signature);
//     //     expect(isValid).to.be.true;
//     // });

//     it("should start a loan directly", async function () {
//         // Deploy WETH and USDC mock tokens
//         const WETH = await ethers.getContractFactory("WETH");
//         weth = await WETH.deploy();
//         await weth.waitForDeployment();

//         const USDC = await ethers.getContractFactory("USDC");
//         usdc = await USDC.deploy();
//         await usdc.waitForDeployment();

//         // Deploy NFT
//         const NFT = await ethers.getContractFactory("NFT");
//         nft = await NFT.deploy();
//         await nft.waitForDeployment();

//         // Deploy EIP712SignMessage
//         const EIP712SignMessage = await ethers.getContractFactory("EIP712SignMessage");
//         eip712SignMessage = await EIP712SignMessage.deploy();
//         await eip712SignMessage.waitForDeployment();

//         // Deploy Calculator
//         const Calculator = await ethers.getContractFactory("Calculator");
//         calculator = await Calculator.deploy();
//         await calculator.waitForDeployment();

//         // // Deploy Settings
//         // const Settings = await ethers.getContractFactory("Settings");
//         // settings = await Settings.deploy(await weth.getAddress(), await usdc.getAddress());
//         // await settings.waitForDeployment();

//         // console.log(weth.target);
//         // console.log(await usdc.getAddress());

//         // Deploy LendmeFi
//         const LendmeFi = await ethers.getContractFactory("LendmeFi");
//         lendmeFi = await LendmeFi.deploy(await weth.getAddress(), await usdc.getAddress());
//         await lendmeFi.waitForDeployment();

//         //console.log(await lendmeFi.erc721whitelist(nft.getAddress()));

//         await lendmeFi.connect(owner).setERC721Whitelist(nft.getAddress(), true);

//         await nft.connect(borrower).safeMint(await borrower.getAddress(), 0);

//         const fullAmount = ethers.parseUnits("1000000", 18);

//         await nft.connect(borrower).setApprovalForAll(await lendmeFi.getAddress(), true);
//         await usdc.connect(owner).transfer(await lender.getAddress(), fullAmount);
//         await usdc.connect(lender).approve(await lendmeFi.getAddress(), ethers.MaxUint256);
//         await usdc.connect(borrower).approve(await lendmeFi.getAddress(), ethers.MaxUint256);

//         async function signBorrowerData(borrower, eip712SignMessage, borrowerData) {



//             return await borrower.signTypedData(domain, types, borrowerData);
//         }

//         let borrowerAddress = await borrower.getAddress();
//         let borrowerNonce = 0;
//         let lenderNonce = 0;
//         let nftCollateralAddress = await nft.getAddress();
//         let nftTokenId = 0;
//         let loanTokenAddress = await usdc.getAddress();
//         let loanAmount = ethers.toBigInt(ethers.parseUnits("0.1", 18)); // BigNumber türüne dönüştür
//         let interestFee = 1000 // BigNumber türüne dönüştür
//         let loanDuration = 3600;

//         // Borrower signs the loan data
//         const borrowerData = {
//             borrowerAddress: borrowerAddress,
//             borrowerNonce: borrowerNonce,
//             nftCollateralAddress: nftCollateralAddress,
//             nftTokenId: nftTokenId,
//             loanTokenAddress: loanTokenAddress,
//             loanAmount: loanAmount,
//             interestFee: interestFee,
//             loanDuration: loanDuration
//         };

//         const domain = {
//             name: "LendmeFi",
//             version: "1",
//             chainId: 31337,
//             verifyingContract: eip712SignMessage.target
//         };

//         const types = {
//             BorrowerData: [
//                 { name: "borrowerAddress", type: "address" },
//                 { name: "borrowerNonce", type: "uint256" },
//                 { name: "nftCollateralAddress", type: "address" },
//                 { name: "nftTokenId", type: "uint256" },
//                 { name: "loanTokenAddress", type: "address" },
//                 { name: "loanAmount", type: "uint256" },
//                 { name: "interestFee", type: "uint256" },
//                 { name: "loanDuration", type: "uint256" }
//             ]
//         };

//         console.log(borrowerData);


//         const borrowerSignature = await borrower.signTypedData(domain, types, borrowerData);

//         const isValid = await eip712SignMessage.verifyBorrowerSignature(borrowerData, borrowerSignature);
//         console.log(isValid);

//         // Adreslerin geçerli olup olmadığını kontrol et
//         expect(ethers.isAddress(borrowerAddress)).to.be.true;
//         expect(ethers.isAddress(nftCollateralAddress)).to.be.true;
//         expect(ethers.isAddress(loanTokenAddress)).to.be.true;

//         // Miktarların doğru formatta olup olmadığını kontrol et
//         // expect(loanAmount).to.be.instanceOf(ethers.toBigInt());
//         // expect(interestFee).to.be.instanceOf(ethers.toBigInt());
//         expect(loanDuration).to.be.a('number');

//         // İmzaların doğru formatta olup olmadığını kontrol et
//         expect(borrowerSignature).to.be.a('string');


//         const tx = await lendmeFi.connect(lender).startLoanDirectly(
//             borrowerAddress,
//             borrowerNonce,
//             lenderNonce,
//             nftCollateralAddress,
//             nftTokenId,
//             loanTokenAddress,
//             loanAmount,
//             interestFee,
//             loanDuration,
//             borrowerSignature,
//         );

//         // İşlemin başarılı olduğunu doğrula
//         // await expect(tx).to.emit(lendmeFi, "LoanStarted").withArgs(
//         //     borrowerAddress,
//         //     lenderAddress,
//         //     nftCollateralAddress,
//         //     nftTokenId,
//         //     loanAmount,
//         //     interestFee,
//         //     loanDuration
//         // );

//         const loan = await lendmeFi.loans(0);
//         expect(loan.borrowerAddress).to.equal(await borrower.getAddress());

//         /*         address _borrowerAddress,
//         uint256 _borrowerNonce,
//         uint256 _lenderNonce,
//         address _nftCollateralAddress,
//         uint256 _nftTokenId,
//         address _loanTokenAddress,
//         uint256 _loanAmount,
//         uint256 _interestFee,
//         uint256 _loanDuration,
//         bytes memory _borrowerSignature */


//         // Check loan details
//         // const loan = await lendmeFi.loans(0);
//         // expect(loan.borrowerAddress).to.equal(await borrower.getAddress());
//         // expect(loan.lenderAddress).to.equal(await lender.getAddress());
//         // expect(loan.loanAmount).to.equal(loanAmount);
//         // expect(loan.interestFee).to.equal(interestFee);
//     });
// });
