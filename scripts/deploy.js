import hre from "hardhat";
import fs from 'fs';

async function main() {
  console.log("开始部署 SimpleToken 合约...");

  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));

  // 部署参数
  const tokenName = "SimpleToken";
  const tokenSymbol = "STK";
  const initialSupply = 1000000; // 1,000,000 tokens

  // 部署合约
  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  const simpleToken = await SimpleToken.deploy(tokenName, tokenSymbol, initialSupply);

  await simpleToken.waitForDeployment();

  const contractAddress = await simpleToken.getAddress();
  console.log("SimpleToken 合约部署成功!");
  console.log("合约地址:", contractAddress);
  console.log("代币名称:", tokenName);
  console.log("代币符号:", tokenSymbol);
  console.log("初始供应量:", initialSupply);
  console.log("部署者余额:", hre.ethers.formatEther(await simpleToken.balanceOf(deployer.address)));

  // 保存合约地址到文件
  const contractInfo = {
    address: contractAddress,
    name: tokenName,
    symbol: tokenSymbol,
    initialSupply: initialSupply,
    deployer: deployer.address,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    './contract-address.json',
    JSON.stringify(contractInfo, null, 2)
  );
  console.log("合约信息已保存到 contract-address.json");

  // 如果在测试网或主网上部署，等待几个区块确认后验证合约
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("等待区块确认...");
    await simpleToken.deploymentTransaction().wait(6);

    console.log("开始验证合约...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [tokenName, tokenSymbol, initialSupply],
      });
      console.log("合约验证成功!");
    } catch (error) {
      console.log("合约验证失败:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });