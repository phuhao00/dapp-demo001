const { ethers } = require('hardhat');
const contractAddress = require('./contract-address.json');

async function main() {
  // 获取合约实例
  const SimpleToken = await ethers.getContractFactory('SimpleToken');
  const token = SimpleToken.attach(contractAddress.address);
  
  // 要查询的地址
  const targetAddress = process.argv[2] || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
  
  console.log('合约地址:', contractAddress.address);
  console.log('查询地址:', targetAddress);
  
  try {
    // 查询余额
    const balance = await token.balanceOf(targetAddress);
    console.log(`地址 ${targetAddress} 的余额: ${ethers.formatEther(balance)} STK`);
    
    // 查询总供应量
    const totalSupply = await token.totalSupply();
    console.log(`总供应量: ${ethers.formatEther(totalSupply)} STK`);
    
    // 查询代币信息
    const name = await token.name();
    const symbol = await token.symbol();
    const decimals = await token.decimals();
    
    console.log(`代币名称: ${name}`);
    console.log(`代币符号: ${symbol}`);
    console.log(`小数位数: ${decimals}`);
    
  } catch (error) {
    console.error('查询失败:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });