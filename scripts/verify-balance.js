import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";

async function main() {
  // 读取合约地址配置
  const contractData = JSON.parse(fs.readFileSync("./contract-address.json", "utf8"));
  
  // 获取合约实例
  const SimpleToken = await ethers.getContractFactory("SimpleToken");
  const token = SimpleToken.attach(contractData.address);
  
  // 要检查的地址
  const addresses = [
    "0x8aB39eA06013E9a33E872f06f1afe1D55f7ef82c", // 当前连接的地址
    "0x34236778380be51b84E9B0215539F5d0f4F7da1d"  // 原来有代币的地址
  ];
  
  console.log("=== STK代币余额验证 ===");
  console.log(`合约地址: ${contractData.address}`);
  console.log(`代币符号: ${contractData.symbol}`);
  console.log("");
  
  for (const address of addresses) {
    try {
      const balance = await token.balanceOf(address);
      const formattedBalance = ethers.formatEther(balance);
      console.log(`地址 ${address}:`);
      console.log(`  余额: ${formattedBalance} STK`);
      console.log("");
    } catch (error) {
      console.error(`检查地址 ${address} 余额时出错:`, error.message);
    }
  }
  
  // 获取代币总供应量
  try {
    const totalSupply = await token.totalSupply();
    console.log(`代币总供应量: ${ethers.formatEther(totalSupply)} STK`);
  } catch (error) {
    console.error("获取总供应量时出错:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });