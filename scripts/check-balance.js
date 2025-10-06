import pkg from 'hardhat';
const { ethers } = pkg;
import fs from 'fs';

// 读取合约地址配置
const contractAddress = JSON.parse(fs.readFileSync('./contract-address.json', 'utf8'));

async function main() {
  // 获取合约实例
  const SimpleToken = await ethers.getContractFactory("SimpleToken");
  const token = SimpleToken.attach(contractAddress.address);
  
  // 用户地址
  const userAddress = "0x34236778380be51b84E9B0215539F5d0f4F7da1d";
  
  console.log("=== STK代币余额检查 ===");
  console.log("合约地址:", contractAddress.address);
  console.log("用户地址:", userAddress);
  console.log("");
  
  try {
    // 检查用户余额
    const balance = await token.balanceOf(userAddress);
    const decimals = await token.decimals();
    const symbol = await token.symbol();
    
    console.log(`用户余额: ${ethers.formatUnits(balance, decimals)} ${symbol}`);
    
    // 检查总供应量
    const totalSupply = await token.totalSupply();
    console.log(`总供应量: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}`);
    
    // 检查合约所有者
    const owner = await token.owner();
    console.log(`合约所有者: ${owner}`);
    
    if (balance.toString() === "0") {
      console.log("");
      console.log("⚠️  用户余额为0，可能的原因:");
      console.log("1. 代币未铸造到该地址");
      console.log("2. 地址输入错误");
      console.log("3. 合约部署后未进行铸造操作");
    } else {
      console.log("");
      console.log("✅ 用户有代币余额！");
    }
    
  } catch (error) {
    console.error("检查余额失败:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });