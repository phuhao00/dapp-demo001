import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAppStore } from '../lib/store';
import { formatTokenAmount, parseTokenAmount } from '../lib/viem';
import { isAddress } from 'viem';
import { ArrowLeft, Send, RefreshCw, Wallet, AlertCircle } from 'lucide-react';
import { CONTRACT_ADDRESS, simpleTokenABI } from '../lib/viem';

interface TransferFormData {
  to: string;
  amount: string;
}

const Transfer: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useAppStore();
  const { address, isConnected } = useAccount();
  
  const [formData, setFormData] = useState<TransferFormData>({
    to: '',
    amount: ''
  });
  
  const [errors, setErrors] = useState<Partial<TransferFormData>>({});
  const [fromBalance, setFromBalance] = useState<bigint>(0n);
  const [isLoadingFromBalance, setIsLoadingFromBalance] = useState(false);

  // 使用 Wagmi 的 writeContract
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  // 等待交易确认
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // 加载发送方余额
  const loadFromBalance = async (address: string) => {
    if (!address || !isAddress(address)) return;
    
    setIsLoadingFromBalance(true);
    try {
      const { publicClient } = await import('../lib/viem');
      const balance = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: simpleTokenABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
      } as any) as bigint;
      
      setFromBalance(balance);
    } catch (error) {
      console.error('加载余额失败:', error);
      setFromBalance(0n);
    } finally {
      setIsLoadingFromBalance(false);
    }
  };

  // 当连接状态变化时加载余额
  useEffect(() => {
    if (isConnected && address) {
      loadFromBalance(address);
    }
  }, [isConnected, address]);

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Partial<TransferFormData> = {};

    if (!formData.to.trim()) {
      newErrors.to = '请输入接收方地址';
    } else if (!isAddress(formData.to)) {
      newErrors.to = '请输入有效的接收方地址';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = '请输入转账金额';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = '请输入有效的转账金额';
    }

    // 检查余额
    if (formData.amount && fromBalance > 0n) {
      const parsedAmount = parseTokenAmount(formData.amount, 18);
      if (parsedAmount > fromBalance) {
        newErrors.amount = '余额不足';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理转账
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!isConnected) {
      showNotification('请先连接 MetaMask 钱包', 'error');
      return;
    }
    
    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: simpleTokenABI,
        functionName: 'transfer',
        args: [formData.to as `0x${string}`, parseTokenAmount(formData.amount, 18)],
      } as any);
    } catch (error: any) {
      console.error('Transfer failed:', error);
      showNotification(
        error.message || '转账失败，请重试',
        'error'
      );
    }
  };

  // 监听交易状态
  useEffect(() => {
    if (isSuccess) {
      showNotification('转账成功！', 'success');
      setFormData({ to: '', amount: '' });
      setErrors({});
      // 刷新余额
      if (address) {
        loadFromBalance(address);
      }
    }
  }, [isSuccess, showNotification, address]);

  // 监听交易错误
  useEffect(() => {
    if (error) {
      showNotification(`转账失败: ${error.message}`, 'error');
    }
  }, [error, showNotification]);

  // 处理输入变化
  const handleInputChange = (field: keyof TransferFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const isTransferring = isPending || isConfirming;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-8">
              <button
                onClick={() => navigate('/')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">转账</h1>
                <p className="text-gray-600">发送代币到其他地址</p>
              </div>
            </div>

            {/* 钱包连接状态 */}
            {!isConnected && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800">请先连接 MetaMask 钱包</span>
                </div>
              </div>
            )}

            {/* 钱包连接成功 */}
            {isConnected && address && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wallet className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-800">钱包已连接</span>
                  </div>
                  <span className="text-sm text-green-600 font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                </div>
                
                {/* 发送方余额 */}
                <div className="mt-3 p-3 bg-white rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">余额:</span>
                    {isLoadingFromBalance ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
                    ) : (
                      <span className="text-sm font-medium">
                        {formatTokenAmount(fromBalance, 18)} STK
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleTransfer} className="space-y-6">
              {/* 接收方地址 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  接收方地址
                </label>
                <input
                  type="text"
                  value={formData.to}
                  onChange={(e) => handleInputChange('to', e.target.value)}
                  placeholder="0x..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.to ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.to && (
                  <p className="mt-1 text-sm text-red-600">{errors.to}</p>
                )}
              </div>

              {/* 转账金额 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  转账金额 (STK)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.0"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isTransferring || !isConnected}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isTransferring ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>
                  {isPending ? '发送交易...' : 
                   isConfirming ? '等待确认...' : 
                   '转账'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;