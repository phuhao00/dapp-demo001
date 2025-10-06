import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";

async function main() {
  // 读取合约地址配置
  const contractData = JSON.parse(fs.readFileSync("./contract-address.json", "utf8"));
  
  // 获取合约实例
  const SimpleToken = await ethers.getContractFactory("SimpleToken");
  const token = SimpleToken.attach(contractData.address);
  
  console.log("=== 多账户STK代币余额检查 ===");
  console.log(`合约地址: ${contractData.address}`);
  console.log(`代币符号: STK`);
  console.log("");
  
  // 检查多个账户
  const accounts = [
    {
      address: "0x34236778380be51b84E9B0215539F5d0f4F7da1d",
      name: "账户 #1"
    },
    {
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 
      name: "账户 #2"
    },
    {
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      name: "合约所有者"
    }
  ];
  
  for (const account of accounts) {
    try {
      const balance = await token.balanceOf(account.address);
      const formattedBalance = ethers.formatEther(balance);
      console.log(`${account.name} (${account.address}):`);
      console.log(`  余额: ${formattedBalance} STK`);
      console.log("");
    } catch (error) {
      console.log(`${account.name} (${account.address}):`);
      console.log(`  检查余额时出错: ${error.message}`);
      console.log("");
    }
  }
  
  // 获取总供应量
  try {
    const totalSupply = await token.totalSupply();
    const formattedTotalSupply = ethers.formatEther(totalSupply);
    console.log(`代币总供应量: ${formattedTotalSupply} STK`);
  } catch (error) {
    console.log(`获取总供应量时出错: ${error.message}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
