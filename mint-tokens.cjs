const { ethers } = require('hardhat');
const contractAddress = require('./contract-address.json');

async function main() {
  // 获取合约实例
  const SimpleToken = await ethers.getContractFactory('SimpleToken');
  const token = SimpleToken.attach(contractAddress.address);
  
  // 获取签名者（默认是第一个账户，即合约所有者）
  const [owner] = await ethers.getSigners();
  
  console.log('合约地址:', contractAddress.address);
  console.log('合约所有者:', owner.address);
  
  // 要铸造代币的目标地址（用户需要替换为自己的钱包地址）
  const targetAddress = process.argv[2];
  
  if (!targetAddress) {
    console.log('请提供目标地址作为参数');
    console.log('使用方法: node mint-tokens.js <目标地址>');
    console.log('例如: node mint-tokens.js 0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
    return;
  }
  
  // 铸造数量（1000 STK）
  const mintAmount = ethers.parseEther('1000');
  
  console.log(`准备给地址 ${targetAddress} 铸造 1000 STK 代币...`);
  
  try {
    // 执行铸造
    const tx = await token.mint(targetAddress, mintAmount);
    console.log('交易哈希:', tx.hash);
    
    // 等待交易确认
    await tx.wait();
    console.log('铸造成功！');
    
    // 查询余额
    const balance = await token.balanceOf(targetAddress);
    console.log(`地址 ${targetAddress} 的余额: ${ethers.formatEther(balance)} STK`);
    
  } catch (error) {
    console.error('铸造失败:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });