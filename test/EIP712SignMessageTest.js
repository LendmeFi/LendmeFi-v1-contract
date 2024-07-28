// import { expect } from "chai";
// import { ethers } from "@nomiclabs/hardhat-ethers";

// describe("EIP712SignMessage", function () {
//     let EIP712SignMessage, eip712SignMessage;
//     let owner, borrower, lender;
//     const addressZero = "0x0000000000000000000000000000000000000000";
//     let borrowerNonce, lenderNonce = BigInt(0);

//     beforeEach(async function () {
//         [owner, borrower, lender] = await ethers.getSigners();
//         const EIP712SignMessageFactory = await ethers.getContractFactory("EIP712SignMessage");
//         eip712SignMessage = await EIP712SignMessageFactory.deploy();
//         await eip712SignMessage.waitForDeployment();
//     });

//     async function signBorrowerData(borrower, eip712SignMessage, borrowerData) {
//         const domain = {
//             name: "LendmeFi",
//             version: "1",
//             chainId: (await ethers.provider.getNetwork()).chainId,
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
//                 { name: "repaymentAmount", type: "uint256" },
//                 { name: "loanDuration", type: "uint256" }
//             ]
//         };

//         return await borrower.signTypedData(domain, types, borrowerData);
//     }

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
//                 { name: "repaymentAmount", type: "uint256" },
//                 { name: "loanDuration", type: "uint256" }
//             ]
//         };

//         return await lender.signTypedData(domain, types, lenderData);
//     }

//     it("should verify borrower signature", async function () {
//         const borrowerData = {
//             borrowerAddress: borrower.address,
//             borrowerNonce: borrowerNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature = await signBorrowerData(borrower, eip712SignMessage, borrowerData);
//         const isValid = await eip712SignMessage.verifyBorrowerSignature(borrowerData, signature);
//         expect(isValid).to.be.true;
//     });

//     it("should verify lender signature", async function () {
//         lenderNonce = await eip712SignMessage.nonces(lender.address);
//         const lenderData = {
//             lenderAddress: lender.address,
//             lenderNonce: lenderNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature = await signLenderData(lender, eip712SignMessage, lenderData);
//         const isValid = await eip712SignMessage.verifyLenderSignature(lenderData, signature);
//         expect(isValid).to.be.true;
//     });

//     it("should execute borrower transaction", async function () {
//         borrowerNonce = await eip712SignMessage.nonces(borrower.address);
//         const borrowerData = {
//             borrowerAddress: borrower.address,
//             borrowerNonce: borrowerNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature = await signBorrowerData(borrower, eip712SignMessage, borrowerData);

//         await expect(eip712SignMessage.executeBorrowerTransaction(borrowerData, signature))
//             .to.emit(eip712SignMessage, "NonceUsed")
//             .withArgs(borrower.address, borrowerNonce);
//     });

//     it("should execute lender transaction", async function () {
//         lenderNonce = await eip712SignMessage.nonces(lender.address);
//         const lenderData = {
//             lenderAddress: lender.address,
//             lenderNonce: lenderNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature = await signLenderData(lender, eip712SignMessage, lenderData);

//         await expect(eip712SignMessage.executeLenderTransaction(lenderData, signature))
//             .to.emit(eip712SignMessage, "NonceUsed")
//             .withArgs(lender.address, lenderNonce);
//     });

//     it("should fail with invalid borrower signature", async function () {
//         borrowerNonce = await eip712SignMessage.nonces(borrower.address);
//         const borrowerData = {
//             borrowerAddress: borrower.address,
//             borrowerNonce: borrowerNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const invalidSignature = "0x" + "0".repeat(130); // Geçersiz imza

//         await expect(eip712SignMessage.executeBorrowerTransaction(borrowerData, invalidSignature))
//             .to.be.revertedWith("Invalid signature");
//     });

//     it("should fail with invalid lender signature", async function () {
//         lenderNonce = await eip712SignMessage.nonces(lender.address);
//         const lenderData = {
//             lenderAddress: lender.address,
//             lenderNonce: lenderNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const invalidSignature = "0x" + "0".repeat(130); // Geçersiz imza

//         await expect(eip712SignMessage.executeLenderTransaction(lenderData, invalidSignature))
//             .to.be.revertedWith("Invalid signature");
//     });

//     it("should fail with invalid borrower nonce", async function () {
//         borrowerNonce = await eip712SignMessage.nonces(borrower.address);
//         const borrowerData = {
//             borrowerAddress: borrower.address,
//             borrowerNonce: borrowerNonce + BigInt(1),
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature = await signBorrowerData(borrower, eip712SignMessage, borrowerData);

//         await expect(eip712SignMessage.executeBorrowerTransaction(borrowerData, signature))
//             .to.be.revertedWith("Invalid nonce");
//     });

//     it("should fail with invalid lender nonce", async function () {
//         lenderNonce = await eip712SignMessage.nonces(lender.address);
//         const lenderData = {
//             lenderAddress: lender.address,
//             lenderNonce: lenderNonce + BigInt(1),
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature = await signLenderData(lender, eip712SignMessage, lenderData);

//         await expect(eip712SignMessage.executeLenderTransaction(lenderData, signature))
//             .to.be.revertedWith("Invalid nonce");
//     });

//     it("should fail on repeated borrower transaction", async function () {
//         borrowerNonce = await eip712SignMessage.nonces(borrower.address);
//         const borrowerData = {
//             borrowerAddress: borrower.address,
//             borrowerNonce: borrowerNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature = await signBorrowerData(borrower, eip712SignMessage, borrowerData);

//         await eip712SignMessage.executeBorrowerTransaction(borrowerData, signature);

//         await expect(eip712SignMessage.executeBorrowerTransaction(borrowerData, signature))
//             .to.be.revertedWith("Invalid nonce");
//     });

//     it("should fail on repeated lender transaction", async function () {
//         lenderNonce = await eip712SignMessage.nonces(lender.address);
//         const lenderData = {
//             lenderAddress: lender.address,
//             lenderNonce: lenderNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature = await signLenderData(lender, eip712SignMessage, lenderData);

//         await eip712SignMessage.executeLenderTransaction(lenderData, signature);

//         await expect(eip712SignMessage.executeLenderTransaction(lenderData, signature))
//             .to.be.revertedWith("Invalid nonce");
//     });
//     it("should fail on repeated borrower transaction with same signature", async function () {
//         borrowerNonce = await eip712SignMessage.nonces(borrower.address);
//         const borrowerData = {
//             borrowerAddress: borrower.address,
//             borrowerNonce: borrowerNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature = await signBorrowerData(borrower, eip712SignMessage, borrowerData);

//         await eip712SignMessage.executeBorrowerTransaction(borrowerData, signature);

//         // Aynı imza ile tekrar işlem yapmayı dene
//         await expect(eip712SignMessage.executeBorrowerTransaction(borrowerData, signature))
//             .to.be.revertedWith("Invalid nonce");
//     });

//     it("should fail on repeated lender transaction with same signature", async function () {
//         lenderNonce = await eip712SignMessage.nonces(lender.address);
//         const lenderData = {
//             lenderAddress: lender.address,
//             lenderNonce: lenderNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature = await signLenderData(lender, eip712SignMessage, lenderData);

//         await eip712SignMessage.executeLenderTransaction(lenderData, signature);

//         // Aynı imza ile tekrar işlem yapmayı dene
//         await expect(eip712SignMessage.executeLenderTransaction(lenderData, signature))
//             .to.be.revertedWith("Invalid nonce");
//     });

//     it("should handle different nonces for borrower correctly", async function () {
//         borrowerNonce = await eip712SignMessage.nonces(borrower.address);
//         const borrowerData1 = {
//             borrowerAddress: borrower.address,
//             borrowerNonce: borrowerNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature1 = await signBorrowerData(borrower, eip712SignMessage, borrowerData1);

//         await eip712SignMessage.executeBorrowerTransaction(borrowerData1, signature1);

//         const newBorrowerNonce = await eip712SignMessage.nonces(borrower.address);
//         const borrowerData2 = {
//             borrowerAddress: borrower.address,
//             borrowerNonce: newBorrowerNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 2,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("200", 18),
//             repaymentAmount: ethers.parseUnits("220", 18),
//             loanDuration: 7200
//         };

//         const signature2 = await signBorrowerData(borrower, eip712SignMessage, borrowerData2);

//         await expect(eip712SignMessage.executeBorrowerTransaction(borrowerData2, signature2))
//             .to.emit(eip712SignMessage, "NonceUsed")
//             .withArgs(borrower.address, newBorrowerNonce);
//     });

//     it("should handle different nonces for lender correctly", async function () {
//         lenderNonce = await eip712SignMessage.nonces(lender.address);
//         const lenderData1 = {
//             lenderAddress: lender.address,
//             lenderNonce: lenderNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature1 = await signLenderData(lender, eip712SignMessage, lenderData1);

//         await eip712SignMessage.executeLenderTransaction(lenderData1, signature1);

//         const newLenderNonce = await eip712SignMessage.nonces(lender.address);
//         const lenderData2 = {
//             lenderAddress: lender.address,
//             lenderNonce: newLenderNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 2,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("200", 18),
//             repaymentAmount: ethers.parseUnits("220", 18),
//             loanDuration: 7200
//         };

//         const signature2 = await signLenderData(lender, eip712SignMessage, lenderData2);

//         await expect(eip712SignMessage.executeLenderTransaction(lenderData2, signature2))
//             .to.emit(eip712SignMessage, "NonceUsed")
//             .withArgs(lender.address, newLenderNonce);
//     });
//     it("should fail with invalid borrower address", async function () {
//         borrowerNonce = await eip712SignMessage.nonces(borrower.address);
//         const borrowerData = {
//             borrowerAddress: addressZero, // Geçersiz adres
//             borrowerNonce: borrowerNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature = await signBorrowerData(borrower, eip712SignMessage, borrowerData);

//         await expect(eip712SignMessage.executeBorrowerTransaction(borrowerData, signature))
//             .to.be.revertedWith("Invalid signature");
//     });

//     it("should fail with invalid lender address", async function () {
//         lenderNonce = await eip712SignMessage.nonces(lender.address);
//         const lenderData = {
//             lenderAddress: addressZero, // Geçersiz adres
//             lenderNonce: lenderNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature = await signLenderData(lender, eip712SignMessage, lenderData);

//         await expect(eip712SignMessage.executeLenderTransaction(lenderData, signature))
//             .to.be.revertedWith("Invalid signature");
//     });

//     it("should fail with outdated nonce", async function () {
//         borrowerNonce = await eip712SignMessage.nonces(borrower.address);
//         const borrowerData = {
//             borrowerAddress: borrower.address,
//             borrowerNonce: borrowerNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const signature = await signBorrowerData(borrower, eip712SignMessage, borrowerData);

//         // Nonce değeri kullanılır ve artırılır
//         await eip712SignMessage.executeBorrowerTransaction(borrowerData, signature);

//         // Eski nonce değeriyle tekrar işlem yapmayı dene
//         await expect(eip712SignMessage.executeBorrowerTransaction(borrowerData, signature))
//             .to.be.revertedWith("Invalid nonce");
//     });

//     it("should fail with different chain ID", async function () {
//         borrowerNonce = await eip712SignMessage.nonces(borrower.address);
//         const borrowerData = {
//             borrowerAddress: borrower.address,
//             borrowerNonce: borrowerNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };

//         const domain = {
//             name: "LendmeFi",
//             version: "1",
//             chainId: 99999, // Farklı zincir kimliği
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
//                 { name: "repaymentAmount", type: "uint256" },
//                 { name: "loanDuration", type: "uint256" }
//             ]
//         };
//         const signature = await borrower.signTypedData(domain, types, borrowerData);
//         await expect(eip712SignMessage.executeBorrowerTransaction(borrowerData, signature))
//             .to.be.revertedWith("Invalid signature");
//     });
//     it("should handle multiple signatures and nonce updates correctly", async function () {
//         // Borrower'ın ilk nonce değerini al
//         borrowerNonce = await eip712SignMessage.nonces(borrower.address);

//         // 1. İmza
//         let borrowerData1 = {
//             borrowerAddress: borrower.address,
//             borrowerNonce: borrowerNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 1,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("100", 18),
//             repaymentAmount: ethers.parseUnits("110", 18),
//             loanDuration: 3600
//         };
//         let signature1 = await signBorrowerData(borrower, eip712SignMessage, borrowerData1);

//         // 2. İmza
//         borrowerNonce = await eip712SignMessage.nonces(borrower.address); // Yeni nonce
//         let borrowerData2 = {
//             borrowerAddress: borrower.address,
//             borrowerNonce: borrowerNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 2,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("200", 18),
//             repaymentAmount: ethers.parseUnits("220", 18),
//             loanDuration: 7200
//         };
//         let signature2 = await signBorrowerData(borrower, eip712SignMessage, borrowerData2);

//         // 3. İmza
//         borrowerNonce = await eip712SignMessage.nonces(borrower.address); // Yeni nonce
//         let borrowerData3 = {
//             borrowerAddress: borrower.address,
//             borrowerNonce: borrowerNonce,
//             nftCollateralAddress: addressZero,
//             nftTokenId: 3,
//             loanTokenAddress: addressZero,
//             loanAmount: ethers.parseUnits("300", 18),
//             repaymentAmount: ethers.parseUnits("330", 18),
//             loanDuration: 10800
//         };
//         let signature3 = await signBorrowerData(borrower, eip712SignMessage, borrowerData3);

//         // 1. İmza ile işlem yap
//         await eip712SignMessage.executeBorrowerTransaction(borrowerData1, signature1);
//         await expect(eip712SignMessage.executeBorrowerTransaction(borrowerData1, signature1))
//             .to.be.revertedWith("Invalid nonce");

//         // 2. İmza ile işlem yap
//         await eip712SignMessage.executeBorrowerTransaction(borrowerData2, signature2);
//         await expect(eip712SignMessage.executeBorrowerTransaction(borrowerData2, signature2))
//             .to.be.revertedWith("Invalid nonce");

//         // 3. İmza ile işlem yap
//         await eip712SignMessage.executeBorrowerTransaction(borrowerData3, signature3);
//         await expect(eip712SignMessage.executeBorrowerTransaction(borrowerData3, signature3))
//             .to.be.revertedWith("Invalid nonce");
//     });
// });