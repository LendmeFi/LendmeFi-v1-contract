const { ethers } = require("ethers");
const hre = require("hardhat");
require('dotenv').config();



const contractAddress = "0x201c11d25F3590De65DD72177D1f4AD364da1d3e"; //scroll sepolia contract address
const nftCollateralAddress = "0x0c35e6F690EC8cF99c4509a2055066dEb043DF96";
const usdcAddress = "0x913efbB29E9C2E3045A082D39B36896D82268977";

// RPC 
const provider = new ethers.JsonRpcProvider("https://sepolia-rpc.scroll.io/");

const privateKey = process.env.PRIVATE_KEY2;
const wallet = new ethers.Wallet(privateKey, provider);



//const contract = new ethers.Contract(contractAddress, abi, provider);
//const signer = contract.connect(wallet);

async function signBorrowerData(borrower, borrowerData) {
    const domain = {
        name: "LendmeFi",
        version: "1",
        chainId: 534351, // scroll sepolia chain id
        verifyingContract: contractAddress
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

// Borrower signs the loan data
const borrowerData = {
    borrowerAddress: wallet.address,
    borrowerNonce: 0,
    nftCollateralAddress: nftCollateralAddress,
    nftTokenId: 0,
    loanTokenAddress: usdcAddress,
    loanAmount: ethers.parseEther("100"),
    interestFee: ethers.parseEther("25"),
    loanDuration: 360000 // 100 hours
};



async function main() {
    const signature = await signBorrowerData(wallet, borrowerData);
    console.log("Signature:", signature);
}

main()

// Example for Remix IDE: ["0xb5ce51798dB5bFc62031Cf0ead243e9948C62aAa","1","0x58ad3dfd53299096751a5231bcac24f61c7b1f86","2","0xaefa96f81054013d8d7936737ebbcc24d3887423","1000000000000000000","100000000000000000","3600"]


/* for Scroll Sepolia SIGNATUE_1: 0xf6cbc545e3bcf400f432e19bbc80927eb549009feec65e8da7398531bd4e5fef0691e7be8cf208a52f145170a3436b7e7d28035ce1128ee7264ec202ef8fe9ff1c

const borrowerData = {
    borrowerAddress: wallet.address,
    borrowerNonce: 0,
    nftCollateralAddress: nftCollateralAddress,
    nftTokenId: 0,
    loanTokenAddress: usdcAddress,
    loanAmount: ethers.parseEther("100"),
    interestFee: ethers.parseEther("25"),
    loanDuration: 360000 // 100 hours
};



*/