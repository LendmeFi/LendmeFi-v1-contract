const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const WETH = await ethers.getContractFactory("WETH");
    const USDC = await ethers.getContractFactory("USDC");
    const NFT = await ethers.getContractFactory("NFT");
    const EIP712SignMessage = await ethers.getContractFactory("EIP712SignMessage");
    const Calculator = await ethers.getContractFactory("Calculator");
    const LendmeFi = await ethers.getContractFactory("LendmeFi");

    const weth = await WETH.deploy();
    await weth.deployed();
    console.log("WETH deployed to:", weth.address);

    const usdc = await USDC.deploy();
    await usdc.deployed();
    console.log("USDC deployed to:", usdc.address);

    const nft = await NFT.deploy();
    await nft.deployed();
    console.log("NFT deployed to:", nft.address);

    const eip712SignMessage = await EIP712SignMessage.deploy();
    await eip712SignMessage.deployed();
    console.log("EIP712SignMessage deployed to:", eip712SignMessage.address);

    const calculator = await Calculator.deploy();
    await calculator.deployed();
    console.log("Calculator deployed to:", calculator.address);

    const lendmeFi = await LendmeFi.deploy(weth.address, usdc.address);
    await lendmeFi.deployed();
    console.log("LendmeFi deployed to:", lendmeFi.address);

    // save deployment addresses to a file
    const fs = require('fs');
    const addresses = {
        WETH: weth.address,
        USDC: usdc.address,
        NFT: nft.address,
        EIP712SignMessage: eip712SignMessage.address,
        Calculator: calculator.address,
        LendmeFi: lendmeFi.address
    };

    fs.writeFileSync('./deployments.json', JSON.stringify(addresses, null, 2));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
