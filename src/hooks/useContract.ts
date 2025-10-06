import { useState, useCallback, useEffect } from 'react'
import { Address } from 'viem'
import { publicClient, simpleTokenABI, CONTRACT_ADDRESS, createWalletClientInstance, formatTokenAmount, parseTokenAmount } from '../lib/viem'
import { useWallet } from './useWallet'

export interface TokenInfo {
  name: string
  symbol: string
  decimals: number
  totalSupply: bigint
  owner: Address
}

export interface ContractState {
  tokenInfo: TokenInfo | null
  balance: bigint
  isLoading: boolean
  error: string | null
}

export const useContract = () => {
  const [contractState, setContractState] = useState<ContractState>({
    tokenInfo: null,
    balance: 0n,
    isLoading: false,
    error: null
  })

  // 获取钱包客户端
  const getWalletClient = useCallback(() => {
    return createWalletClientInstance()
  }, [])

  // 获取代币信息
  const fetchTokenInfo = useCallback(async (): Promise<TokenInfo> => {
    try {
      const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: simpleTokenABI,
          functionName: 'name'
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: simpleTokenABI,
          functionName: 'symbol'
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: simpleTokenABI,
          functionName: 'decimals'
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: simpleTokenABI,
          functionName: 'totalSupply'
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: simpleTokenABI,
          functionName: 'owner'
        })
      ])

      return {
        name: name as string,
        symbol: symbol as string,
        decimals: decimals as number,
        totalSupply: totalSupply as bigint,
        owner: owner as string
      }
    } catch (error) {
      console.error('获取代币信息失败:', error)
      throw error
    }
  }, [])

  // 获取余额
  const fetchBalance = useCallback(async (userAddress: Address): Promise<bigint> => {
    try {
      const balance = await publicClient.readContract({
        address: CONTRACT_ADDRESS as Address,
        abi: simpleTokenABI,
        functionName: 'balanceOf',
        args: [userAddress]
      } as any) as bigint;
      
      return balance;
    } catch (error) {
      console.error('获取余额失败:', error)
      return 0n
    }
  }, [])

  // 刷新数据
  const refreshData = useCallback(async () => {
    setContractState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const tokenInfo = await fetchTokenInfo()

      setContractState(prev => ({
        ...prev,
        tokenInfo,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      console.error('刷新数据失败:', error)
      setContractState(prev => ({
        ...prev,
        isLoading: false,
        error: '获取合约数据失败'
      }))
    }
  }, [fetchTokenInfo])

  // 转账
  const transfer = useCallback(async (from: Address, to: Address, amount: string): Promise<boolean> => {
    try {
      // 检查是否有MetaMask连接
      if (!window.ethereum) {
        throw new Error('请安装MetaMask钱包')
      }

      // 检查当前连接的账户
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length === 0) {
        throw new Error('请先连接MetaMask钱包')
      }

      // 检查发送地址是否与当前连接的账户匹配
      const currentAccount = accounts[0].toLowerCase()
      if (from.toLowerCase() !== currentAccount) {
        // 尝试请求用户切换账户
        try {
          await window.ethereum.request({ 
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          })
          
          // 重新检查账户
          const newAccounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (newAccounts.length > 0) {
            const newAccount = newAccounts[0].toLowerCase()
            if (from.toLowerCase() !== newAccount) {
              throw new Error(`请确保MetaMask中已导入地址 ${from} 的账户，当前连接的是 ${newAccount}`)
            }
          } else {
            throw new Error('请先连接MetaMask钱包')
          }
        } catch (switchError: any) {
          if (switchError.code === 4001) {
            throw new Error('用户取消了账户切换，请手动切换到正确的账户')
          }
          throw new Error(`账户切换失败: ${switchError.message}`)
        }
      }

      const walletClient = getWalletClient()
      const decimals = contractState.tokenInfo?.decimals || 18
      const parsedAmount = parseTokenAmount(amount, decimals)

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as Address,
        abi: simpleTokenABI,
        functionName: 'transfer',
        args: [to, parsedAmount],
        account: from,
        chain: walletClient.chain
      })

      // 等待交易确认
      await publicClient.waitForTransactionReceipt({ hash })
      
      return true
    } catch (error: any) {
      console.error('转账失败:', error)
      
      // 处理特定的错误情况
      if (error.message?.includes('pending request') || error.message?.includes('there is a pending request')) {
        throw new Error('有未完成的交易请求，请等待当前交易完成后再试。如果问题持续，请刷新页面重试。')
      } else if (error.message?.includes('User rejected') || error.code === 4001) {
        throw new Error('用户取消了交易')
      } else if (error.message?.includes('insufficient funds')) {
        throw new Error('余额不足')
      } else if (error.message?.includes('gas')) {
        throw new Error('Gas费用不足，请增加Gas限制')
      } else if (error.message?.includes('execution reverted')) {
        throw new Error('交易执行失败，请检查余额和地址是否正确')
      }
      
      throw new Error(error.message || '转账失败')
    }
  }, [contractState.tokenInfo, getWalletClient])

  // 铸造代币（仅所有者）
  const mint = useCallback(async (from: Address, to: Address, amount: string): Promise<boolean> => {
    if (from !== contractState.tokenInfo?.owner) {
      throw new Error('只有合约所有者可以铸造代币')
    }

    try {
      const walletClient = getWalletClient()
      const decimals = contractState.tokenInfo?.decimals || 18
      const parsedAmount = parseTokenAmount(amount, decimals)

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as Address,
        abi: simpleTokenABI,
        functionName: 'mint',
        args: [to, parsedAmount],
        account: from,
        chain: walletClient.chain
      })

      // 等待交易确认
      await publicClient.waitForTransactionReceipt({ hash })
      
      return true
    } catch (error: any) {
      console.error('铸造失败:', error)
      throw new Error(error.message || '铸造失败')
    }
  }, [contractState.tokenInfo, getWalletClient])

  // 销毁代币
  const burn = useCallback(async (from: Address, amount: string): Promise<boolean> => {
    try {
      const walletClient = getWalletClient()
      const decimals = contractState.tokenInfo?.decimals || 18
      const parsedAmount = parseTokenAmount(amount, decimals)

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as Address,
        abi: simpleTokenABI,
        functionName: 'burn',
        args: [parsedAmount],
        account: from,
        chain: walletClient.chain
      })

      // 等待交易确认
      await publicClient.waitForTransactionReceipt({ hash })
      
      return true
    } catch (error: any) {
      console.error('销毁失败:', error)
      throw new Error(error.message || '销毁失败')
    }
  }, [contractState.tokenInfo, getWalletClient])

  // 检查是否为合约所有者
  const isOwner = useCallback((address: Address): boolean => {
    return address === contractState.tokenInfo?.owner
  }, [contractState.tokenInfo?.owner])

  // 格式化余额显示
  const formatBalance = useCallback((balance?: bigint): string => {
    const bal = balance || contractState.balance
    const decimals = contractState.tokenInfo?.decimals || 18
    return formatTokenAmount(bal, decimals)
  }, [contractState.balance, contractState.tokenInfo?.decimals])

  // 初始化代币信息
  useEffect(() => {
    const loadTokenInfo = async () => {
      setContractState(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const tokenInfo = await fetchTokenInfo()
        setContractState(prev => ({
          ...prev,
          tokenInfo,
          isLoading: false,
          error: null
        }))
      } catch (error) {
        console.error('加载代币信息失败:', error)
        setContractState(prev => ({
          ...prev,
          isLoading: false,
          error: '获取代币信息失败'
        }))
      }
    }

    loadTokenInfo()
  }, [fetchTokenInfo])

  return {
    ...contractState,
    transfer,
    mint,
    burn,
    isOwner,
    formatBalance,
    refreshData,
    fetchBalance
  }
}