const { ethers } = require("ethers");
const hre = require("hardhat");
require('dotenv').config();



const contractAddress = "0xdd60eda0416e88408051a7d4ea09cf13b388f67b";

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

let borrowerNonce = 0;
const nftCollateralAddress = "0x1d38e008e23991948d4e265af705151ca84dd995";
const nftTokenId = 1;
const loanTokenAddress = "0x1d38e008e23991948d4e265af705151ca84dd995";
const loanAmount = ethers.parseEther("1");
const interestFee = ethers.parseEther("0.1");
const loanDuration = 3600;

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


isSignatureValid();