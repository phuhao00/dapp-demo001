const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('开始部署 SimpleToken 合约...');

  // 读取编译后的 ABI 和字节码
  const abiPath = path.join(__dirname, 'artifacts/contracts/contracts_SimpleToken_sol_SimpleToken.abi');
  const binPath = path.join(__dirname, 'artifacts/contracts/contracts_SimpleToken_sol_SimpleToken.bin');
  
  const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
  const bytecode = '0x' + fs.readFileSync(binPath, 'utf8').trim();

  // 获取签名者
  const [deployer] = await ethers.getSigners();
  console.log('部署账户:', deployer.address);
  console.log('账户余额:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'ETH');

  // 创建合约工厂
  const SimpleTokenFactory = new ethers.ContractFactory(abi, bytecode, deployer);

  // 部署合约
  const tokenName = 'SimpleToken';
  const tokenSymbol = 'STK';
  const initialSupply = ethers.parseUnits('1000000', 18); // 1,000,000 tokens

  console.log('正在部署合约...');
  const simpleToken = await SimpleTokenFactory.deploy(tokenName, tokenSymbol, initialSupply);
  
  // 等待部署完成
  await simpleToken.waitForDeployment();
  const contractAddress = await simpleToken.getAddress();
  
  console.log('SimpleToken 合约已部署到:', contractAddress);
  console.log('代币名称:', tokenName);
  console.log('代币符号:', tokenSymbol);
  console.log('初始供应量:', ethers.formatUnits(initialSupply, 18));

  // 保存合约地址到文件
  const contractInfo = {
    address: contractAddress,
    name: tokenName,
    symbol: tokenSymbol,
    initialSupply: initialSupply.toString(),
    deployer: deployer.address,
    deploymentTime: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(__dirname, 'contract-address.json'),
    JSON.stringify(contractInfo, null, 2)
  );

  console.log('合约信息已保存到 contract-address.json');
  
  // 验证部署
  const deployedContract = new ethers.Contract(contractAddress, abi, deployer);
  const totalSupply = await deployedContract.totalSupply();
  const ownerBalance = await deployedContract.balanceOf(deployer.address);
  
  console.log('验证部署:');
  console.log('- 总供应量:', ethers.formatUnits(totalSupply, 18));
  console.log('- 部署者余额:', ethers.formatUnits(ownerBalance, 18));
  console.log('- 合约所有者:', await deployedContract.owner());

  return contractAddress;
}

main()
  .then((address) => {
    console.log('\n部署成功! 合约地址:', address);
    process.exit(0);
  })
  .catch((error) => {
    console.error('部署失败:', error);
    process.exit(1);
  });