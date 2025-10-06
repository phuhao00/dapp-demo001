import { useState, useEffect, useCallback } from 'react'
import { createWalletClient, custom, getAddress, type Address } from 'viem'
import { defaultChain, isMetaMaskInstalled } from '../lib/viem'

export type WalletType = 'MetaMask' | 'TokenPocket' | 'WalletConnect' | 'Coinbase Wallet'

export interface WalletState {
  isConnected: boolean
  address: Address | null
  isConnecting: boolean
  error: string | null
  walletType: WalletType | null
}

// 钱包检测函数 - 只检测MetaMask
const detectWallets = () => {
  const wallets: { type: WalletType; available: boolean; provider?: any }[] = []
  
  // 只检测 MetaMask
  if (window.ethereum?.isMetaMask) {
    wallets.push({ type: 'MetaMask', available: true, provider: window.ethereum })
  } else if (window.ethereum?.providers) {
    // 如果有多个提供者，寻找MetaMask
    const metamask = window.ethereum.providers.find((p: any) => p.isMetaMask)
    if (metamask) {
      wallets.push({ type: 'MetaMask', available: true, provider: metamask })
    }
  }
  
  return wallets
}

// 获取钱包提供者 - 强制只返回MetaMask
const getWalletProvider = (walletType: WalletType) => {
  // 强制只支持MetaMask
  if (walletType !== 'MetaMask') {
    return null
  }
  
  // 检查MetaMask
  if (!window.ethereum) {
    return null
  }
  
  const ethereum = window.ethereum as any
  
  // 如果是MetaMask直接返回
  if (ethereum.isMetaMask) {
    return ethereum
  }
  
  // 如果有多个提供者，寻找MetaMask
  if (ethereum.providers && Array.isArray(ethereum.providers)) {
    const metamask = ethereum.providers.find((p: any) => p.isMetaMask)
    if (metamask) {
      return metamask
    }
  }
  
  return null
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isConnecting: false,
    error: null,
    walletType: null
  })
  
  // 获取可用钱包列表
  const getAvailableWallets = useCallback(() => {
    return detectWallets()
  }, [])

  // 检查钱包连接状态
  const checkConnection = useCallback(async () => {
    if (!window.ethereum) {
      setWalletState(prev => ({
        ...prev,
        error: '未检测到钱包'
      }))
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        const address = getAddress(accounts[0])
        
        // 检测当前连接的钱包类型
        let currentWalletType: WalletType = 'MetaMask' // 默认
        if (window.ethereum.isTokenPocket) {
          currentWalletType = 'TokenPocket'
        } else if (window.ethereum.isCoinbaseWallet) {
          currentWalletType = 'Coinbase Wallet'
        } else if (window.ethereum.isMetaMask) {
          currentWalletType = 'MetaMask'
        }
        
        setWalletState({
          isConnected: true,
          address,
          isConnecting: false,
          error: null,
          walletType: currentWalletType
        })
      } else {
        setWalletState({
          isConnected: false,
          address: null,
          isConnecting: false,
          error: null,
          walletType: null
        })
      }
    } catch (error) {
      console.error('检查钱包连接失败:', error)
      setWalletState(prev => ({
        ...prev,
        error: '检查钱包连接失败'
      }))
    }
  }, [])

  // 连接钱包 - 强制只使用MetaMask
  const connect = useCallback(async (walletType?: WalletType) => {
    // 强制只允许MetaMask
    if (walletType !== 'MetaMask') {
      setWalletState(prev => ({
        ...prev,
        error: '此应用只支持MetaMask钱包'
      }))
      return
    }
    
    const targetWalletType = 'MetaMask'
    const provider = getWalletProvider(targetWalletType)
    
    if (!provider) {
      setWalletState(prev => ({
        ...prev,
        error: '请安装MetaMask钱包'
      }))
      return
    }
    
    // 强制检查是否为MetaMask
    if (!provider.isMetaMask) {
      setWalletState(prev => ({
        ...prev,
        error: '检测到非MetaMask钱包，此应用只支持MetaMask'
      }))
      return
    }

    setWalletState(prev => ({
      ...prev,
      isConnecting: true,
      error: null
    }))

    try {
      let accounts: string[] = []
      
      if (targetWalletType === 'WalletConnect') {
        // WalletConnect 的特殊处理逻辑
        throw new Error('WalletConnect 功能正在开发中')
      } else {
        // 强制使用MetaMask提供者请求连接
        console.log('强制使用MetaMask提供者请求连接');
        
        // 确保provider是MetaMask
        if (!provider.isMetaMask) {
          throw new Error('提供的不是MetaMask钱包');
        }
        
        // 直接调用MetaMask的eth_requestAccounts
        accounts = await provider.request({ method: 'eth_requestAccounts' });
        console.log('MetaMask连接成功，账户:', accounts);
      }
      
      if (accounts.length > 0) {
        const address = getAddress(accounts[0])
        
        // 检查并切换到正确的网络（使用更安全的方式）
        try {
          await switchToCorrectNetwork(provider)
        } catch (networkError) {
          console.warn('网络切换失败，但钱包已连接:', networkError)
          // 即使网络切换失败，也允许钱包连接成功
        }
        
        setWalletState({
          isConnected: true,
          address,
          isConnecting: false,
          error: null,
          walletType: targetWalletType
        })
      }
    } catch (error: any) {
      console.error('连接钱包失败:', error)
      let errorMessage = `连接 ${targetWalletType} 失败`
      
      if (error.code === 4001) {
        errorMessage = '用户拒绝连接钱包'
      } else if (error.code === -32002) {
        errorMessage = '钱包连接请求已在处理中'
      } else if (error.code === -32603) {
        errorMessage = '钱包内部错误，请重试'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setWalletState({
        isConnected: false,
        address: null,
        isConnecting: false,
        error: errorMessage,
        walletType: null
      })
    }
  }, [])

  // 切换账户
  const switchAccount = useCallback(async () => {
    if (!window.ethereum) {
      setWalletState(prev => ({
        ...prev,
        error: '未检测到钱包'
      }))
      return
    }

    setWalletState(prev => ({
      ...prev,
      isConnecting: true,
      error: null
    }))

    try {
      // 请求切换账户
      const accounts = await window.ethereum.request({ 
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      })
      
      // 重新获取账户列表
      const newAccounts = await window.ethereum.request({ method: 'eth_accounts' })
      
      if (newAccounts.length > 0) {
        const address = getAddress(newAccounts[0])
        setWalletState({
          isConnected: true,
          address,
          isConnecting: false,
          error: null,
          walletType: 'MetaMask'
        })
      } else {
        setWalletState({
          isConnected: false,
          address: null,
          isConnecting: false,
          error: '未选择账户',
          walletType: null
        })
      }
    } catch (error: any) {
      console.error('切换账户失败:', error)
      let errorMessage = '切换账户失败'
      
      if (error.code === 4001) {
        errorMessage = '用户拒绝切换账户'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage
      }))
    }
  }, [])

  // 断开钱包连接
  const disconnect = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      isConnecting: false,
      error: null,
      walletType: null
    })
  }, [])

  // 切换到正确的网络
  const switchToCorrectNetwork = useCallback(async (provider = window.ethereum) => {
    if (!provider) return

    const targetChainId = `0x${defaultChain.id.toString(16)}`
    
    try {
      // 首先检查当前网络
      const currentChainId = await provider.request({ method: 'eth_chainId' })
      
      // 如果已经在正确的网络上，直接返回
      if (currentChainId === targetChainId) {
        return
      }
      
      // 尝试切换网络
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }]
      })
    } catch (error: any) {
      // 如果网络不存在，尝试添加网络
      if (error.code === 4902) {
        try {
          const networkParams = {
            chainId: targetChainId,
            chainName: defaultChain.name,
            nativeCurrency: defaultChain.nativeCurrency,
            rpcUrls: [defaultChain.rpcUrls.default.http[0]]
          }
          
          // 只有当 blockExplorers 存在时才添加
          if (defaultChain.blockExplorers?.default) {
            (networkParams as any).blockExplorerUrls = [defaultChain.blockExplorers.default.url]
          }
          
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [networkParams]
          })
        } catch (addError) {
          console.error('添加网络失败:', addError)
          throw new Error('添加网络失败')
        }
      } else if (error.code === 4001) {
        // 用户拒绝切换网络
        throw new Error('用户拒绝切换网络')
      } else {
        console.error('切换网络失败:', error)
        throw new Error('切换网络失败')
      }
    }
  }, [])

  // 监听账户变化
  useEffect(() => {
    if (!isMetaMaskInstalled()) return

    const handleAccountsChanged = (accounts: string[]) => {
      try {
        if (accounts.length === 0) {
          disconnect()
        } else {
          const address = getAddress(accounts[0])
          setWalletState(prev => ({
            ...prev,
            address,
            isConnected: true,
            error: null
          }))
        }
      } catch (error) {
        console.error('处理账户变化失败:', error)
        setWalletState(prev => ({
          ...prev,
          error: '处理账户变化失败'
        }))
      }
    }

    const handleChainChanged = (chainId: string) => {
      try {
        // 网络变化时重新检查连接，添加延迟以避免竞态条件
        setTimeout(() => {
          checkConnection()
        }, 100)
      } catch (error) {
        console.error('处理网络变化失败:', error)
      }
    }

    // 使用更安全的事件监听方式
    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    // 初始检查连接状态
    checkConnection()

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [checkConnection, disconnect])

  return {
    ...walletState,
    connect,
    disconnect,
    switchAccount,
    switchToCorrectNetwork,
    getAvailableWallets
  }
}