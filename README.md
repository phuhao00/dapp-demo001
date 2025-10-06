# STK 代币 DApp

一个基于 React + TypeScript + Vite 构建的 ERC20 代币 DApp，支持代币转账、余额查询、铸币等功能的完整区块链应用。

## 🚀 项目特性

- **ERC20 代币合约**: 基于 OpenZeppelin 的标准化代币合约
- **现代化前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **钱包集成**: MetaMask 钱包连接和交互
- **多页面应用**: 首页、转账、管理页面
- **本地开发**: Hardhat 本地网络支持
- **响应式设计**: 移动端友好的用户界面

## 📁 项目结构

```
contractnew/
├── contracts/              # Solidity 智能合约
│   └── SimpleToken.sol     # ERC20 代币合约
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── pages/             # 页面组件
│   ├── hooks/             # 自定义 Hooks
│   ├── lib/               # 工具库和配置
│   └── types/             # TypeScript 类型定义
├── api/                   # 后端 API
├── scripts/               # 部署和管理脚本
├── artifacts/             # 编译后的合约文件
└── test/                  # 测试文件
```

## 🛠️ 技术栈

### 前端
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具和开发服务器
- **Tailwind CSS** - 样式框架
- **Wagmi** - React Hooks for Ethereum
- **Viem** - 以太坊客户端库
- **React Router** - 路由管理
- **Zustand** - 状态管理

### 区块链
- **Hardhat** - 以太坊开发环境
- **OpenZeppelin** - 安全的智能合约库
- **Solidity 0.8.20** - 智能合约语言

### 后端
- **Express.js** - Node.js 服务器
- **CORS** - 跨域资源共享

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm (推荐) 或 npm
- MetaMask 浏览器扩展

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 启动本地开发环境

1. **启动 Hardhat 本地网络**
```bash
npx hardhat node
```

2. **部署智能合约**
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. **启动前端和后端**
```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run client:dev  # 前端 (http://localhost:5173)
npm run server:dev  # 后端 (http://localhost:3000)
```

### 配置 MetaMask

1. **添加本地网络**
   - 网络名称: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - 链 ID: `31337`
   - 货币符号: `ETH`

2. **导入测试账户**
   - 地址: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
   - 私钥: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

3. **添加 STK 代币**
   - 合约地址: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
   - 符号: `STK`
   - 精度: `18`

## 📱 功能特性

### 首页 (Home)
- 钱包连接和断开
- 代币余额查询
- 用户地址验证
- 实时余额显示

### 转账页面 (Transfer)
- 代币转账功能
- 接收地址验证
- 转账数量输入
- 交易状态跟踪

### 管理页面 (Admin)
- 代币铸造功能
- 合约信息查询
- 管理员操作

## 🔧 开发命令

```bash
# 开发环境
npm run dev              # 同时启动前端和后端
npm run client:dev       # 仅启动前端
npm run server:dev       # 仅启动后端

# 构建
npm run build            # 构建生产版本
npm run preview          # 预览构建结果

# 代码质量
npm run lint             # ESLint 检查
npm run check            # TypeScript 类型检查

# 区块链相关
npx hardhat node         # 启动本地网络
npx hardhat compile      # 编译合约
npx hardhat test         # 运行测试
```

## 📋 可用脚本

### 部署脚本
- `scripts/deploy.js` - 部署合约
- `scripts/mint-tokens.js` - 铸造代币
- `scripts/check-balance.js` - 查询余额

### 管理脚本
- `mint-tokens.cjs` - 铸造代币 (CommonJS)
- `check-balance.cjs` - 查询余额 (CommonJS)
- `deploy-manual.cjs` - 手动部署 (CommonJS)

## 🌐 网络配置

### 本地开发
- **网络**: Hardhat Local
- **RPC URL**: `http://127.0.0.1:8545`
- **链 ID**: `31337`

### 测试网
- **Sepolia**: 支持 Sepolia 测试网部署
- **主网**: 支持以太坊主网部署

## 📖 使用指南

### 添加代币到 MetaMask

详细步骤请参考：
- [MetaMask代币添加指南.md](./MetaMask代币添加指南.md)
- [STK代币手动添加指南.md](./STK代币手动添加指南.md)

### 获取测试代币

1. 使用管理员账户铸造代币
2. 通过转账功能分发代币
3. 使用铸币脚本批量铸造

## 🔒 安全注意事项

- ⚠️ 测试私钥仅用于本地开发，切勿在主网使用
- ⚠️ 本地网络数据在重启后会重置
- ⚠️ 生产环境请使用安全的私钥管理方案

## 🐛 故障排除

### 常见问题

1. **MetaMask 连接失败**
   - 检查网络配置是否正确
   - 确认 Hardhat 节点正在运行
   - 尝试刷新页面

2. **代币余额显示为 0**
   - 确认已添加 STK 代币到 MetaMask
   - 检查合约地址是否正确
   - 尝试铸造一些测试代币

3. **交易失败**
   - 检查账户余额是否充足
   - 确认网络连接正常
   - 查看浏览器控制台错误信息

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

## 📄 许可证

MIT License

---

**开发愉快！** 🎉
