import pkg from "hardhat";
const { ethers } = pkg;
import fs from "fs";

async function main() {
  // 读取合约地址配置
  const contractData = JSON.parse(fs.readFileSync("./contract-address.json", "utf8"));
  
  // 获取合约实例
  const SimpleToken = await ethers.getContractFactory("SimpleToken");
  const token = SimpleToken.attach(contractData.address);
  
  // 目标地址 - 第二个测试账户
  const targetAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  
  // 铸造100,000个代币 (考虑18位小数)
  const amount = ethers.parseEther("100000");
  
  console.log(`正在为地址 ${targetAddress} 铸造 100,000 STK 代币...`);
  
  try {
    const tx = await token.mint(targetAddress, amount);
    console.log(`交易哈希: ${tx.hash}`);
    
    // 等待交易确认
    await tx.wait();
    console.log("代币铸造成功!");
    
    // 检查余额
    const balance = await token.balanceOf(targetAddress);
    console.log(`地址 ${targetAddress} 的STK余额: ${ethers.formatEther(balance)} STK`);
    
  } catch (error) {
    console.error("铸造失败:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });