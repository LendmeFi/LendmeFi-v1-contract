const { expect } = require("chai");
const hre = require("hardhat");

describe("EIP712SignMessage", function () {
    let EIP712SignMessage;
    let eip712SignMessage;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        EIP712SignMessage = await hre.ethers.getContractFactory("EIP712SignMessage");
        [owner, addr1, addr2] = await hre.ethers.getSigners();
        eip712SignMessage = await EIP712SignMessage.deploy();
        await eip712SignMessage.deployed();
    });

    it("should verify valid borrower signature", async function () {
        const nonce= await eip712SignMessage.nonces(addr1.address);
        const borrowerData = {
            borrower: addr1.address,
            tokenId: 1,
            amount: 100,
            nonce: nonce
        };

        const domain = {
            name: "LendmeFi",
            version: "1",
            chainId: (await hre.ethers.provider.getNetwork()).chainId,
            verifyingContract: eip712SignMessage.address,
        };

        const types = {
            BorrowerData: [
                { name: "borrower", type: "address" },
                { name: "tokenId", type: "uint256" },
                { name: "amount", type: "uint256" },
                { name: "nonce", type: "uint256" },
            ],
        };

        const signature = await addr1._signTypedData(domain, types, borrowerData);

        // Verify signature using the contract method
        expect(
            await eip712SignMessage.isValidBorrowerSignature(borrowerData, signature)
        ).to.be.true;
    });
});
