const { configDotenv } = require("dotenv");

require("@nomicfoundation/hardhat-toolbox");
configDotenv();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
};
