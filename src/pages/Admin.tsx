import React, { useState, useEffect } from 'react';
import { Shield, Plus, Minus, ArrowLeft, AlertCircle, Info, Crown } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useContract } from '../hooks/useContract';
import { useAppStore } from '../lib/store';
import { isAddress } from 'viem';

interface MintFormData {
  to: string;
  amount: string;
}

interface BurnFormData {
  amount: string;
}

const Admin: React.FC = () => {
  const { isConnected, address } = useWallet();
  const { tokenInfo, balance, formatBalance, mint, burn, isOwner, isLoading } = useContract();
  const { showNotification } = useAppStore();
  
  const [mintForm, setMintForm] = useState<MintFormData>({
    to: '',
    amount: ''
  });
  const [burnForm, setBurnForm] = useState<BurnFormData>({
    amount: ''
  });
  const [isMinting, setIsMinting] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [mintErrors, setMintErrors] = useState<Partial<MintFormData>>({});
  const [burnErrors, setBurnErrors] = useState<Partial<BurnFormData>>({});
  const [ownerStatus, setOwnerStatus] = useState<boolean | null>(null);

  // 检查所有者状态
  useEffect(() => {
    const checkOwnerStatus = async () => {
      if (isConnected && address) {
        try {
          const isOwnerResult = await isOwner();
          setOwnerStatus(isOwnerResult);
        } catch (error) {
          console.error('Failed to check owner status:', error);
          setOwnerStatus(false);
        }
      }
    };

    checkOwnerStatus();
  }, [isConnected, address, isOwner]);

  // 验证铸造表单
  const validateMintForm = (): boolean => {
    const newErrors: Partial<MintFormData> = {};
    
    if (!mintForm.to.trim()) {
      newErrors.to = '请输入接收地址';
    } else if (!isAddress(mintForm.to)) {
      newErrors.to = '请输入有效的以太坊地址';
    }
    
    if (!mintForm.amount.trim()) {
      newErrors.amount = '请输入铸造金额';
    } else {
      const amount = parseFloat(mintForm.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = '请输入有效的金额';
      }
    }
    
    setMintErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 验证销毁表单
  const validateBurnForm = (): boolean => {
    const newErrors: Partial<BurnFormData> = {};
    
    if (!burnForm.amount.trim()) {
      newErrors.amount = '请输入销毁金额';
    } else {
      const amount = parseFloat(burnForm.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = '请输入有效的金额';
      } else if (amount > parseFloat(formatBalance())) {
        newErrors.amount = '销毁金额不能超过当前余额';
      }
    }
    
    setBurnErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理铸造
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateMintForm()) return;
    
    setIsMinting(true);
    try {
      await mint(mintForm.to as `0x${string}`, mintForm.amount);
      showNotification('代币铸造成功！', 'success');
      setMintForm({ to: '', amount: '' });
      setMintErrors({});
    } catch (error: any) {
      console.error('Mint failed:', error);
      showNotification(
        error.message || '铸造失败，请重试',
        'error'
      );
    } finally {
      setIsMinting(false);
    }
  };

  // 处理销毁
  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateBurnForm()) return;
    
    setIsBurning(true);
    try {
      await burn(burnForm.amount);
      showNotification('代币销毁成功！', 'success');
      setBurnForm({ amount: '' });
      setBurnErrors({});
    } catch (error: any) {
      console.error('Burn failed:', error);
      showNotification(
        error.message || '销毁失败，请重试',
        'error'
      );
    } finally {
      setIsBurning(false);
    }
  };

  // 处理铸造表单输入变化
  const handleMintInputChange = (field: keyof MintFormData, value: string) => {
    setMintForm(prev => ({ ...prev, [field]: value }));
    if (mintErrors[field]) {
      setMintErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 处理销毁表单输入变化
  const handleBurnInputChange = (field: keyof BurnFormData, value: string) => {
    setBurnForm(prev => ({ ...prev, [field]: value }));
    if (burnErrors[field]) {
      setBurnErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 设置铸造地址为当前地址
  const handleMintToSelf = () => {
    if (address) {
      setMintForm(prev => ({ ...prev, to: address }));
    }
  };

  // 设置最大销毁金额
  const handleMaxBurn = () => {
    setBurnForm(prev => ({ ...prev, amount: formatBalance() }));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            钱包未连接
          </h2>
          <p className="text-gray-600 mb-4">
            请先连接钱包才能使用管理功能
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (ownerStatus === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <Shield className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            权限不足
          </h2>
          <p className="text-gray-600 mb-4">
            只有合约所有者才能访问管理功能
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (ownerStatus === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">检查权限中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面头部 */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => window.history.back()}
            className="mr-4 p-2 hover:bg-white hover:shadow-md rounded-lg transition-all"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Crown className="mr-2 text-yellow-500" size={28} />
              合约管理
            </h1>
            <p className="text-gray-600">
              管理 {tokenInfo?.symbol || 'STK'} 代币的铸造和销毁
            </p>
          </div>
        </div>

        {/* 管理员信息 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Shield className="mr-2" size={24} />
            管理员信息
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Crown className="mr-2 text-yellow-500" size={20} />
                <span className="font-semibold text-gray-800">合约所有者</span>
              </div>
              <p className="font-mono text-sm text-gray-600 break-all">
                {tokenInfo?.owner}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Info className="mr-2 text-blue-500" size={20} />
                <span className="font-semibold text-gray-800">当前余额</span>
              </div>
              <p className="text-lg font-semibold text-blue-600">
                {formatBalance()} {tokenInfo?.symbol || 'STK'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 铸造代币 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Plus className="mr-2 text-green-500" size={24} />
              铸造代币
            </h2>

            <form onSubmit={handleMint} className="space-y-4">
              {/* 接收地址 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  接收地址
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={mintForm.to}
                    onChange={(e) => handleMintInputChange('to', e.target.value)}
                    placeholder="0x..."
                    className={`w-full px-3 py-2 pr-16 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      mintErrors.to ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleMintToSelf}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                  >
                    SELF
                  </button>
                </div>
                {mintErrors.to && (
                  <p className="mt-1 text-sm text-red-600">{mintErrors.to}</p>
                )}
              </div>

              {/* 铸造金额 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  铸造金额
                </label>
                <input
                  type="number"
                  step="any"
                  value={mintForm.amount}
                  onChange={(e) => handleMintInputChange('amount', e.target.value)}
                  placeholder="0.0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    mintErrors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {mintErrors.amount && (
                  <p className="mt-1 text-sm text-red-600">{mintErrors.amount}</p>
                )}
              </div>

              {/* 铸造按钮 */}
              <button
                type="submit"
                disabled={isMinting || isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isMinting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    铸造中...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2" size={16} />
                    铸造代币
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                💡 铸造新代币将增加总供应量，新代币将发送到指定地址
              </p>
            </div>
          </div>

          {/* 销毁代币 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <Minus className="mr-2 text-red-500" size={24} />
              销毁代币
            </h2>

            <form onSubmit={handleBurn} className="space-y-4">
              {/* 销毁金额 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  销毁金额
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={burnForm.amount}
                    onChange={(e) => handleBurnInputChange('amount', e.target.value)}
                    placeholder="0.0"
                    className={`w-full px-3 py-2 pr-16 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      burnErrors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleMaxBurn}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  >
                    MAX
                  </button>
                </div>
                {burnErrors.amount && (
                  <p className="mt-1 text-sm text-red-600">{burnErrors.amount}</p>
                )}
              </div>

              {/* 当前余额显示 */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">当前余额:</span>
                  <span className="font-semibold text-gray-800">
                    {formatBalance()} {tokenInfo?.symbol || 'STK'}
                  </span>
                </div>
              </div>

              {/* 销毁按钮 */}
              <button
                type="submit"
                disabled={isBurning || isLoading || balance === 0n}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isBurning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    销毁中...
                  </>
                ) : (
                  <>
                    <Minus className="mr-2" size={16} />
                    销毁代币
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                ⚠️ 销毁代币将永久减少总供应量，此操作不可逆转
              </p>
            </div>
          </div>
        </div>

        {/* 合约信息 */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            合约信息
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {tokenInfo ? formatBalance(tokenInfo.totalSupply) : '0'}
              </div>
              <div className="text-sm text-gray-600">总供应量</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {tokenInfo?.decimals || 18}
              </div>
              <div className="text-sm text-gray-600">小数位数</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {tokenInfo?.symbol || 'STK'}
              </div>
              <div className="text-sm text-gray-600">代币符号</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;