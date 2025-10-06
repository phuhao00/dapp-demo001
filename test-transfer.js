const { ethers } = require('hardhat');

async function testTransfer() {
  console.log('开始测试转账功能...');
  
  try {
    // 获取合约实例
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const SimpleToken = await ethers.getContractFactory('SimpleToken');
    const contract = SimpleToken.attach(contractAddress);
    
    // 获取测试账户
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    console.log('合约地址:', contractAddress);
    console.log('所有者地址:', owner.address);
    console.log('测试地址1:', addr1.address);
    console.log('测试地址2:', addr2.address);
    
    // 检查合约信息
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    
    console.log('\n合约信息:');
    console.log('名称:', name);
    console.log('符号:', symbol);
    console.log('总供应量:', ethers.formatEther(totalSupply), symbol);
    
    // 检查初始余额
    const ownerBalance = await contract.balanceOf(owner.address);
    const addr1Balance = await contract.balanceOf(addr1.address);
    
    console.log('\n初始余额:');
    console.log('所有者余额:', ethers.formatEther(ownerBalance), symbol);
    console.log('地址1余额:', ethers.formatEther(addr1Balance), symbol);
    
    // 测试转账
    const transferAmount = ethers.parseEther('100');
    console.log('\n执行转账: 从所有者转账', ethers.formatEther(transferAmount), symbol, '到地址1');
    
    const tx = await contract.connect(owner).transfer(addr1.address, transferAmount);
    console.log('交易哈希:', tx.hash);
    
    // 等待交易确认
    const receipt = await tx.wait();
    console.log('交易已确认，区块号:', receipt.blockNumber);
    
    // 检查转账后余额
    const newOwnerBalance = await contract.balanceOf(owner.address);
    const newAddr1Balance = await contract.balanceOf(addr1.address);
    
    console.log('\n转账后余额:');
    console.log('所有者余额:', ethers.formatEther(newOwnerBalance), symbol);
    console.log('地址1余额:', ethers.formatEther(newAddr1Balance), symbol);
    
    // 验证转账是否成功
    const expectedOwnerBalance = ownerBalance - transferAmount;
    const expectedAddr1Balance = addr1Balance + transferAmount;
    
    if (newOwnerBalance === expectedOwnerBalance && newAddr1Balance === expectedAddr1Balance) {
      console.log('\n✅ 转账测试成功！');
    } else {
      console.log('\n❌ 转账测试失败！');
      console.log('预期所有者余额:', ethers.formatEther(expectedOwnerBalance));
      console.log('实际所有者余额:', ethers.formatEther(newOwnerBalance));
      console.log('预期地址1余额:', ethers.formatEther(expectedAddr1Balance));
      console.log('实际地址1余额:', ethers.formatEther(newAddr1Balance));
    }
    
    // 测试从地址1转账到地址2
    console.log('\n测试从地址1转账到地址2...');
    const transferAmount2 = ethers.parseEther('50');
    
    const tx2 = await contract.connect(addr1).transfer(addr2.address, transferAmount2);
    console.log('交易哈希:', tx2.hash);
    
    await