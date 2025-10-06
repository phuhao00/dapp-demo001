import React from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, WagmiProvider, createConfig } from "wagmi"
import { mainnet, sepolia, hardhat } from "wagmi/chains"
import { metaMask } from "wagmi/connectors"

// 创建 Wagmi 配置
export const config = createConfig({
  ssr: true, // 启用 SSR 支持
  chains: [mainnet, sepolia, hardhat],
  connectors: [
    metaMask({
      // 可选：添加 Infura API Key
      // infuraAPIKey: process.env.VITE_INFURA_API_KEY,
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [hardhat.id]: http("http://localhost:8546"), // 本地 Hardhat 网络
  },
})

// 创建 QueryClient
export const queryClient = new QueryClient()

// Wagmi Provider 组件
export const WagmiProviderComponent = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    WagmiProvider,
    { config },
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    )
  )
}