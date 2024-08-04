//require('@nomiclabs/hardhat-ethers');
//require('@nomiclabs/hardhat-etherscan');
require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

// The LendmeFi contract is verified on Scroll Sepolia testnet: https://sepolia.scrollscan.com/address/0x201c11d25F3590De65DD72177D1f4AD364da1d3e#code
// WETH : https://sepolia.scrollscan.com/address/0xC100a0179319ae61F6751815991a0D427012A434#code
// USDC : https://sepolia.scrollscan.com/address/0x913efbB29E9C2E3045A082D39B36896D82268977#code
// NFT1 : https://sepolia.scrollscan.com/address/0x0c35e6F690EC8cF99c4509a2055066dEb043DF96#code

const { PRIVATE_KEY, ETHERSCAN_API_KEY, PRIVATE_KEY2, PRIVATE_KEY3, SCROLLSCAN_API_KEY } = process.env;

module.exports = {
  solidity: "0.8.20",
  // sourcify: {
  //   enabled: true
  // },

  networks: {
    hardhat: {},
    sepolia: {
      url: `https://1rpc.io/sepolia`,
      accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY2}`, `0x${PRIVATE_KEY3}`],
    },

    // Chain id: 534351 , Block expolorer: https://sepolia.scrollscan.com/
    scroll_sepolia: {
      url: `https://sepolia-rpc.scroll.io/`,
      accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY2}`, `0x${PRIVATE_KEY3}`],
      chainId: 534351,
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      scroll_sepolia: SCROLLSCAN_API_KEY,
    },
    customChains: [
      {
        network: "scroll_sepolia",
        chainId: 534351,
        urls: {
          apiURL: "https://api-sepolia.scrollscan.com/api",
          browserURL: "https://sepolia.scrollscan.com/"
        }
      }
    ]
  },

};