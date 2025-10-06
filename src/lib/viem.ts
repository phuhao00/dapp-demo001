import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { mainnet, sepolia, hardhat } from 'viem/chains'

// 支持的网络配置
export const chains = {
  mainnet,
  sepolia,
  hardhat: {
    ...hardhat,
    rpcUrls: {
      default: {
        http: ['http://127.0.0.1:8546']
      },
      public: {
        http: ['http://127.0.0.1:8546']
      }
    }
  }
} as const

// 默认链
export const defaultChain = chains.hardhat

// 创建公共客户端（用于读取区块链数据）
export const publicClient = createPublicClient({
  chain: defaultChain,
  transport: http(),
  batch: {
    multicall: {
      batchSize: 1024,
      wait: 16,
    },
  },
  pollingInterval: 1000,
})

// 创建钱包客户端的工厂函数（用于发送交易）
export const createWalletClientInstance = () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed')
  }
  
  try {
    // 强制使用MetaMask提供者
    let metamaskProvider = window.ethereum;
    
    // 如果有多个提供者，强制选择MetaMask
    if (window.ethereum && (window.ethereum as any).providers) {
      const providers = (window.ethereum as any).providers;
      const metamask = providers.find((p: any) => p.isMetaMask);
      if (metamask) {
        metamaskProvider = metamask;
        console.log('强制使用MetaMask提供者创建钱包客户端');
      }
    }
    
    return createWalletClient({
      chain: defaultChain,
      transport: custom(metamaskProvider!, {
        // 添加更好的错误处理和重试机制
        retryCount: 5,
        retryDelay: 2000
      })
    })
  } catch (error) {
    console.error('创建钱包客户端失败:', error)
    throw new Error('创建钱包客户端失败')
  }
}

// 合约 ABI
export const simpleTokenABI = [
  // ERC20 标准函数
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // SimpleToken 特有函数
  {
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "amount", "type": "uint256"}],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "from", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "burnFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractInfo",
    "outputs": [
      {"name": "name_", "type": "string"},
      {"name": "symbol_", "type": "string"},
      {"name": "decimals_", "type": "uint8"},
      {"name": "totalSupply_", "type": "uint256"},
      {"name": "owner_", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // 事件
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "TokensMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "TokensBurned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "owner", "type": "address"},
      {"indexed": true, "name": "spender", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Approval",
    "type": "event"
  }
] as const

// 合约地址 - 已更新为最新部署的地址
export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as const

// 检查 MetaMask 是否安装
export const isMetaMaskInstalled = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return Boolean(
    window.ethereum && 
    window.ethereum.isMetaMask &&
    typeof window.ethereum.request === 'function'
  )
}

// 格式化代币数量（从 wei 转换为可读格式）
export const formatTokenAmount = (amount: bigint, decimals: number = 18): string => {
  try {
    const divisor = BigInt(10 ** decimals)
    const quotient = amount / divisor
    const remainder = amount % divisor
    
    if (remainder === 0n) {
      return quotient.toString()
    }
    
    const remainderStr = remainder.toString().padStart(decimals, '0')
    const trimmedRemainder = remainderStr.replace(/0+$/, '')
    
    return trimmedRemainder ? `${quotient}.${trimmedRemainder}` : quotient.toString()
  } catch (error) {
    console.error('格式化代币数量失败:', error)
    return '0'
  }
}

// 解析代币数量（从可读格式转换为 wei）
export const parseTokenAmount = (amount: string, decimals: number = 18): bigint => {
  try {
    const [integer, decimal = ''] = amount.split('.')
    const paddedDecimal = decimal.padEnd(decimals, '0').slice(0, decimals)
    return BigInt(integer + paddedDecimal)
  } catch (error) {
    console.error('解析代币数量失败:', error)
    return 0n
  }
}