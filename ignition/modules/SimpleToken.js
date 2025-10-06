const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("SimpleTokenModule", (m) => {
  // 部署参数
  const tokenName = m.getParameter("tokenName", "SimpleToken");
  const tokenSymbol = m.getParameter("tokenSymbol", "STK");
  const initialSupply = m.getParameter("initialSupply", 1000000); // 1,000,000 tokens

  // 部署 SimpleToken 合约
  const simpleToken = m.contract("SimpleToken", [tokenName, tokenSymbol, initialSupply]);

  return { simpleToken };
});