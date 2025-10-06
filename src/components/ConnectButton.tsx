import React from 'react'
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { Wallet, LogOut } from 'lucide-react'

export const ConnectButton: React.FC = () => {
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Wallet className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-700">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>断开</span>
        </button>
      </div>
    )
  }

  return (
    <div className="flex space-x-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Wallet className="w-4 h-4" />
          <span>{isPending ? '连接中...' : `连接 ${connector.name}`}</span>
        </button>
      ))}
    </div>
  )
}
