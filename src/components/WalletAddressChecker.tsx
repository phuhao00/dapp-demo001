import React from 'react';
import { AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';

interface WalletAddressCheckerProps {
  connectedAddress?: string;
  targetAddress: string;
  isConnected: boolean;
  onSwitchAccount?: () => void;
  isSwitching?: boolean;
}

export const WalletAddressChecker: React.FC<WalletAddressCheckerProps> = ({
  connectedAddress,
  targetAddress,
  isConnected,
  onSwitchAccount,
  isSwitching = false
}) => {
  const isCorrectAddress = connectedAddress?.toLowerCase() === targetAddress.toLowerCase();
  
  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="text-yellow-600 mr-3 mt-0.5" size={20} />
          <div>
            <h4 className="text-yellow-800 font-medium mb-1">钱包未连接</h4>
            <p className="text-yellow-700 text-sm">
              请连接MetaMask钱包以查看您的STK代币余额
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (isCorrectAddress) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle className="text-green-600 mr-3 mt-0.5" size={20} />
          <div>
            <h4 className="text-green-800 font-medium mb-1">✅ 正确的钱包地址</h4>
            <p className="text-green-700 text-sm mb-2">
              您已连接到拥有STK代币的钱包地址
            </p>
            <p className="text-green-600 text-xs font-mono break-all">
              {connectedAddress}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <AlertTriangle className="text-red-600 mr-3 mt-0.5" size={20} />
        <div className="w-full">
          <h4 className="text-red-800 font-medium mb-2">❌ 钱包地址不匹配</h4>
          <p className="text-red-700 text-sm mb-3">
            您连接的钱包地址与拥有STK代币的地址不同
          </p>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-red-600 font-medium">当前连接地址:</span>
              <p className="font-mono text-xs bg-red-100 p-2 rounded mt-1 break-all">
                {connectedAddress}
              </p>
            </div>
            
            <div>
              <span className="text-red-600 font-medium">STK代币所在地址:</span>
              <p className="font-mono text-xs bg-red-100 p-2 rounded mt-1 break-all">
                {targetAddress}
              </p>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-red-100 rounded">
            <p className="text-red-800 text-sm font-medium mb-2">解决方案:</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={onSwitchAccount}
                  disabled={isSwitching}
                  className="flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isSwitching ? 'animate-spin' : ''}`} />
                  {isSwitching ? '切换中...' : '切换账户'}
                </button>
                <span className="text-red-700 text-xs">点击切换MetaMask账户</span>
              </div>
              <ol className="text-red-700 text-xs space-y-1 list-decimal list-inside ml-4">
                <li>在MetaMask中切换到拥有STK代币的账户</li>
                <li>或者导入包含STK代币的钱包私钥/助记词</li>
                <li>确保连接的是正确的MetaMask账户</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};