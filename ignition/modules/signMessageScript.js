const { ethers } = require("ethers");
const hre = require("hardhat");
require('dotenv').config();



const contractAddress = "0x6208bed3a300aac7fb50538cd43ce65b342dbc20";

// RPC 
const provider = new ethers.JsonRpcProvider("https://1rpc.io/sepolia");

const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);



//const contract = new ethers.Contract(contractAddress, abi, provider);
//const signer = contract.connect(wallet);

const domain = {
    name: "LendmeFi",
    version: "1",
    chainId: 11155111,
    verifyingContract: contractAddress,
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

let borrowerNonce = 3;
const nftCollateralAddress = "0x58ad3dfd53299096751a5231bcac24f61c7b1f86";
const nftTokenId = 0;
const loanTokenAddress = "0xE0CB4cE84379B249adA5D40decc53D663212b9D3";
const loanAmount = ethers.parseEther("0.000000000001");
const interestFee = ethers.parseEther("0.0000000000001");
const loanDuration = 150;
//10000000000000000
//10000000000000000
//1000000000000

// Borrower signs the loan data
const borrowerData = {
    borrowerAddress: wallet.address,
    borrowerNonce: borrowerNonce,
    nftCollateralAddress: nftCollateralAddress,
    nftTokenId: nftTokenId,
    loanTokenAddress: loanTokenAddress,
    loanAmount: loanAmount,
    interestFee: interestFee,
    loanDuration: loanDuration
};


async function isSignatureValid() {
    const signature = await wallet.signTypedData(domain, types, borrowerData);
    console.log("Signature:", signature);
}

console.log(borrowerData);

// ["0xb5ce51798dB5bFc62031Cf0ead243e9948C62aAa","1","0x58ad3dfd53299096751a5231bcac24f61c7b1f86","2","0xaefa96f81054013d8d7936737ebbcc24d3887423","1000000000000000000","100000000000000000","3600"]


isSignatureValid();