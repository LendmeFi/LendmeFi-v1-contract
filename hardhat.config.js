//require('@nomiclabs/hardhat-ethers');
//require('@nomiclabs/hardhat-etherscan');
require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const { PRIVATE_KEY, ETHERSCAN_API_KEY, PRIVATE_KEY2, PRIVATE_KEY3 } = process.env;

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    sepolia: {
      url: `https://1rpc.io/sepolia`,
      accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY2}`, `0x${PRIVATE_KEY3}`],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};