import React, { useState } from 'react';
import { ChevronDown, Wallet, Smartphone, Link, Square } from 'lucide-react';

export interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  isInstalled?: boolean;
}

// 钱包图标组件
const WalletIcon: React.FC<{ iconType: string; className?: string }> = ({ iconType, className = "w-5 h-5" }) => {
  switch (iconType) {
    case 'metamask':
      return <Wallet className={`${className} text-orange-500`} />;
    case 'tokenpocket':
      return <Smartphone className={`${className} text-blue-500`} />;
    case 'walletconnect':
      return <Link className={`${className} text-blue-600`} />;
    case 'coinbase':
      return <Square className={`${className} text-blue-700`} />;
    default:
      return <Wallet className={`${className} text-gray-400`} />;
  }
};

interface WalletSelectorProps {
  onConnect: (walletId: string) => void;
  selectedWallet?: string;
  isConnecting?: boolean;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'metamask',
    description: '此应用只支持MetaMask钱包',
    isInstalled: typeof window !== 'undefined' && window.ethereum?.isMetaMask
  }
];

export const WalletSelector: React.FC<WalletSelectorProps> = ({
  onConnect,
  selectedWallet,
  isConnecting = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedWalletOption = WALLET_OPTIONS.find(w => w.id === selectedWallet);

  const handleWalletClick = (walletId: string) => {
    onConnect(walletId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* 选择器按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isConnecting}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <div className="flex items-center space-x-3">
          {selectedWalletOption ? (
            <>
              <WalletIcon iconType={selectedWalletOption.icon} className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium text-gray-900">{selectedWalletOption.name}</div>
                <div className="text-sm text-gray-500">{selectedWalletOption.description}</div>
              </div>
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5 text-gray-400" />
              <div className="text-left">
                <div className="font-medium text-gray-900">选择钱包</div>
                <div className="text-sm text-gray-500">点击选择要连接的钱包</div>
              </div>
            </>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="py-1">
            {WALLET_OPTIONS.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleWalletClick(wallet.id)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  selectedWallet === wallet.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                } ${!wallet.isInstalled ? 'opacity-60' : ''}`}
                disabled={!wallet.isInstalled}
              >
                <WalletIcon iconType={wallet.icon} className="w-6 h-6 mr-3" />
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{wallet.name}</span>
                    {!wallet.isInstalled && (
                      <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">未安装</span>
                    )}
                    {wallet.isInstalled && selectedWallet === wallet.id && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">已选择</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{wallet.description}</div>
                </div>
              </button>
            ))}
          </div>
          
          {/* 底部提示 */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-600">
              💡 提示：请确保已安装并解锁对应的钱包扩展
            </p>
          </div>
        </div>
      )}
      
      {/* 点击外部关闭下拉菜单 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default WalletSelector;