import React, { useState } from 'react';
import { User, Coins, RefreshCw, LogIn, LogOut } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { CONTRACT_ADDRESS, publicClient, simpleTokenABI } from '../lib/viem';
import { isAddress } from 'viem';

const Home: React.FC = () => {
  const { showNotification } = useAppStore();
  const [userAddress, setUserAddress] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [userBalance, setUserBalance] = useState<bigint>(0n);

  const handleLogin = async () => {
    if (!userAddress.trim()) {
      showNotification('请输入有效的以太坊地址', 'error');
      return;
    }

    if (!isAddress(userAddress)) {
      showNotification('请输入有效的以太坊地址格式', 'error');
      return;
    }

    setIsLoadingBalance(true);
    try {
      // 直接调用合约获取用户余额
      const balance = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: simpleTokenABI,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`]
      } as any) as bigint;
      
      setUserBalance(balance);
      setIsLoggedIn(true);
      showNotification('登录成功！', 'success');
    } catch (error) {
      console.error('登录失败:', error);
      showNotification('获取余额失败，请检查地址是否正确', 'error');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserAddress('');
    setUserBalance(0n);
    showNotification('已退出登录', 'info');
  };

  const handleRefresh = async () => {
    if (!isLoggedIn || !userAddress) return;
    
    setIsLoadingBalance(true);
    try {
      const balance = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: simpleTokenABI,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`]
      } as any) as bigint;
      
      setUserBalance(balance);
      showNotification('余额已刷新', 'success');
    } catch (error) {
      console.error('刷新余额失败:', error);
      showNotification('刷新余额失败', 'error');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const formatBalance = (balance: bigint) => {
    return (Number(balance) / Math.pow(10, 18)).toFixed(4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SimpleToken DApp</h1>
              <p className="text-gray-600">查看您的代币余额</p>
            </div>

            {!isLoggedIn ? (
              <div className="space-y-6">
                <div className="text-center">
                  <User className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">登录查看余额</h2>
                  <p className="text-gray-600">输入您的以太坊地址来查看代币余额</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      以太坊地址
                    </label>
                    <input
                      type="text"
                      value={userAddress}
                      onChange={(e) => setUserAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={isLoadingBalance}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoadingBalance ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <LogIn className="w-5 h-5" />
                    )}
                    <span>{isLoadingBalance ? '登录中...' : '登录'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <Coins className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">账户信息</h2>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      地址
                    </label>
                    <p className="text-sm text-gray-900 font-mono break-all">
                      {userAddress}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      代币余额
                    </label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatBalance(userBalance)} STK
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleRefresh}
                    disabled={isLoadingBalance}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoadingBalance ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-5 h-5" />
                    )}
                    <span>{isLoadingBalance ? '刷新中...' : '刷新余额'}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;