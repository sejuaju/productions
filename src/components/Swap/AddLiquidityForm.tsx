"use client"

import React, { useState, useEffect } from 'react';
import TokenSelector from '../UI/TokenSelector';
import AddLiquidityConfirmModal from './AddLiquidityConfirmModal';
import { useWallet } from '@/context/WalletContext';
import { useExtSwap } from '@/hooks/useExtSwap';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import { LiquidityPositionsRef } from './LiquidityPositions';
import { 
  formatTokenDisplay, 
  formatTokenInput, 
  formatExchangeRate,
  formatPoolShare 
} from '@/utils/tokenFormatter';

interface AddLiquidityFormProps {
  onLiquidityAdded?: () => void;
  liquidityPositionsRef?: React.RefObject<LiquidityPositionsRef | null>;
  onTokenSelectionChange?: (tokenAddress: string) => void;
}

const AddLiquidityForm: React.FC<AddLiquidityFormProps> = ({ onLiquidityAdded, liquidityPositionsRef, onTokenSelectionChange }) => {
  const [textAmount, setTextAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
  const [liquidityError, setLiquidityError] = useState<string | null>(null);
  const [lpTokenAmount, setLpTokenAmount] = useState<string>('');

  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [textBalance, setTextBalance] = useState('0');
  const [pairInfo, setPairInfo] = useState<any>(null);

  const { isConnected, connectWallet, isConnecting } = useWallet();
  const { 
    isLoading, 
    error, 
    isValidNetwork,
    getTokenInfo, 
    getTEXTBalance, 
    getPairInfo,
    calculateLiquidityAmounts,
    addLiquidity,
    clearError 
  } = useExtSwap();
  const { calculateUSDValue, formatUSDDisplay, loading: priceLoading } = useTokenPrice();

  useEffect(() => {
    if (isConnected && isValidNetwork) {
      loadTokenInfo();
      loadBalances();
      loadPairInfo();
    }
  }, [isConnected, isValidNetwork, tokenAddress]);

  const loadTokenInfo = async () => {
    try {
      if (tokenAddress) {
        const info = await getTokenInfo(tokenAddress);
        setTokenInfo(info);
      } else {
        setTokenInfo(null);
      }
    } catch (err) {
      console.error('Failed to load token info:', err);
    }
  };

  const loadBalances = async () => {
    try {
      const balance = await getTEXTBalance();
      setTextBalance(balance);
    } catch (err) {
      console.error('Failed to load balances:', err);
    }
  };

  const loadPairInfo = async () => {
    try {
      if (tokenAddress) {
        const info = await getPairInfo(tokenAddress);
        setPairInfo(info);
      } else {
        setPairInfo(null);
      }
    } catch (err) {
      console.error('Failed to load pair info:', err);
    }
  };

  useEffect(() => {
    if (isConnected && pairInfo?.exists && textAmount && !tokenAmount && tokenAddress) {
      calculateAmounts();
    }
  }, [textAmount, pairInfo, tokenAddress]);

  const calculateAmounts = async () => {
    if (!textAmount || !pairInfo?.exists || !tokenAddress) return;
    
    try {
      const result = await calculateLiquidityAmounts(tokenAddress, '0', textAmount);
      if (!result.isNewPair) {
        setTokenAmount(formatTokenInput(result.tokenAmount));
      }
    } catch (err) {
      console.error('Failed to calculate amounts:', err);
    }
  };

  const handleTextAmountChange = (amount: string) => {
    if (!isConnected) return;
    setTextAmount(amount);
    
    if (!pairInfo?.exists || !tokenAddress) {
      return;
    }
    
    if (amount && pairInfo?.reserve0 && pairInfo?.reserve1) {
      const rate = parseFloat(pairInfo.reserve0) / parseFloat(pairInfo.reserve1);
      const calculatedAmount = parseFloat(amount) * rate;
      setTokenAmount(formatTokenInput(calculatedAmount));
    }
  };

  const handleTokenAmountChange = (amount: string) => {
    if (!isConnected) return;
    setTokenAmount(amount);
    
    if (!pairInfo?.exists || !tokenAddress) {
      return;
    }
    
    if (amount && pairInfo?.reserve0 && pairInfo?.reserve1) {
      const rate = parseFloat(pairInfo.reserve1) / parseFloat(pairInfo.reserve0);
      const calculatedAmount = parseFloat(amount) * rate;
      setTextAmount(formatTokenInput(calculatedAmount));
    }
  };

  const handleTokenChange = (newTokenId: string) => {
    if (newTokenId === 'text') {
      return;
    } else if (newTokenId.startsWith('0x')) {
        setTokenAddress(newTokenId);
      if (liquidityPositionsRef?.current) {
        liquidityPositionsRef.current.addUserToken(newTokenId);
      }
      
      if (onTokenSelectionChange) {
        onTokenSelectionChange(newTokenId);
      }
      
      loadTokenInfo();
      loadPairInfo();
    } else {
      setTokenAddress('');
      if (onTokenSelectionChange) {
        onTokenSelectionChange('');
      }
    }
    
    setTextAmount('');
    setTokenAmount('');
  };

  const handleMaxTextClick = () => {
    if (!isConnected) return;
    const maxAmount = Math.max(0, parseFloat(textBalance) - 0.01);
    handleTextAmountChange(formatTokenInput(maxAmount));
  };

  const handleMaxTokenClick = () => {
    if (!isConnected || !tokenInfo) return;
    handleTokenAmountChange(formatTokenInput(tokenInfo.balance));
  };

  const handleAddLiquidityClick = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }

    if (!isValidNetwork) {
      return;
    }

    if (!hasValidAmounts) {
      return;
    }

    handleOpenConfirm();
  };

  const handleConfirmAddLiquidity = async () => {
    try {
      setIsAddingLiquidity(true);
      setLiquidityError(null);
      
      const result = await addLiquidity({
        tokenAddress,
        tokenAmount,
        textAmount,
        slippage
      });

      if (result && result.receipt) {
        try {
          const transferEvents = result.receipt.logs.filter((log: any) => 
            log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' &&
            log.topics.length === 3 && 
            log.topics[2] && log.topics[2].toLowerCase().includes(result.receipt.from.slice(2).toLowerCase())
          );
          
          if (transferEvents.length > 0) {
            const lpEvent = transferEvents[transferEvents.length - 1];
            const amount = BigInt(lpEvent.data);
            const formattedAmount = (Number(amount) / 1e18).toFixed(6);
            setLpTokenAmount(formattedAmount);
          }
        } catch (parseErr) {
          const estimated = Math.sqrt(parseFloat(textAmount) * parseFloat(tokenAmount));
          setLpTokenAmount(estimated.toFixed(6));
        }
      }

      await loadTokenInfo();
      await loadBalances();
      setLiquidityError(null);
      clearError();
      
      return Promise.resolve();
    } catch (err: any) {
      console.error('Add liquidity failed:', err);
      setLiquidityError(err.message || 'Failed to add liquidity');
      throw err;
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  const handleAddLiquiditySuccess = () => {
    setTextAmount('');
    setTokenAmount('');
    setLpTokenAmount('');
    
    if (onLiquidityAdded) {
      onLiquidityAdded();
    }
  };

  const handleRetryAddLiquidity = () => {
    setLiquidityError(null);
    handleConfirmAddLiquidity();
  };

  const handleClearLiquidityError = () => {
    setLiquidityError(null);
  };

  const handleOpenConfirm = () => {
    setLiquidityError(null);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setLiquidityError(null);
    clearError();
  };

  // USD value calculation helpers
  const getTextAmountUSD = () => {
    if (!textAmount || parseFloat(textAmount) === 0 || priceLoading) return null;
    const usdValue = calculateUSDValue(textAmount);
    return formatUSDDisplay(usdValue);
  };

  const getTextBalanceUSD = () => {
    if (priceLoading || !isConnected || !textBalance || parseFloat(textBalance) <= 0) return null;
    const usdValue = calculateUSDValue(textBalance);
    return formatUSDDisplay(usdValue);
  };

  const estimatedPoolShare = pairInfo?.totalSupply && tokenAmount && pairInfo?.reserve0 
    ? formatPoolShare(
        parseFloat(tokenAmount),
        parseFloat(pairInfo.reserve0) + parseFloat(tokenAmount)
      )
    : '0%';

  const isNewPair = !pairInfo?.exists;
  const hasValidAmounts = textAmount && tokenAmount && parseFloat(textAmount) > 0 && parseFloat(tokenAmount) > 0 && tokenAddress;
  const hasInsufficientBalance = (parseFloat(textAmount) > parseFloat(textBalance)) || 
                                 (tokenInfo && parseFloat(tokenAmount) > parseFloat(tokenInfo.balance));

  return (
    <>
    <div className="card p-6 max-w-lg mx-auto shadow-lg dark:shadow-md dark:bg-[var(--bg-card)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Add Liquidity</h2>
        <div className="text-sm text-[var(--text-secondary)]">
            <a href="#" className="text-[var(--primary)] hover:underline cursor-pointer">Learn more</a>
          </div>
        </div>

        {isConnected && !isValidNetwork && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">
              ⚠️ Please switch to ExatechL2 network to use ExtSwap
            </p>
          </div>
        )}

        {error && !isConfirmOpen && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            <button 
              onClick={clearError}
              className="text-red-600 dark:text-red-400 text-xs underline mt-1 cursor-pointer hover:opacity-80"
            >
              Dismiss
            </button>
      </div>
        )}
      
      <div className="space-y-6">
        <TokenSelector 
          label="First Token"
            value="text"
            onChange={() => {}}
            balance={isConnected ? formatTokenDisplay(textBalance, 'tEXT') : '--'}
            balanceUSD={isConnected && isValidNetwork ? getTextBalanceUSD() : null}
            amount={textAmount}
            amountUSD={getTextAmountUSD()}
            onAmountChange={handleTextAmountChange}
            onMaxClick={handleMaxTextClick}
            disabled={!isConnected || !isValidNetwork}
        />

        <div className="flex justify-center">
            <div className="p-2 rounded-full bg-[var(--primary)] bg-opacity-10 text-[var(--primary)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
          </div>
        </div>

        <TokenSelector 
          label="Second Token"
            value={tokenAddress}
            onChange={handleTokenChange}
            balance={isConnected && tokenInfo ? formatTokenDisplay(tokenInfo.balance, tokenInfo.symbol) : '--'}
            balanceUSD={null} // No USD for other tokens yet
            amount={tokenAmount}
            amountUSD={null} // No USD for other tokens yet
            onAmountChange={handleTokenAmountChange}
            onMaxClick={handleMaxTokenClick}
            disabled={!isConnected || !isValidNetwork}
        />
      </div>

        {isConnected && isValidNetwork && pairInfo && (
        <div className="bg-[var(--hover)] dark:bg-[var(--bg-primary)] rounded-lg p-4 mt-6 space-y-3">
            {isNewPair ? (
              <div className="text-center">
                <p className="text-[var(--primary)] font-medium">🆕 New Pair</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  You are the first to provide liquidity for this pair
                </p>
              </div>
            ) : (
              <>
          <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">Current Rate</span>
            <span className="font-medium text-[var(--text-primary)]">
                    {pairInfo.reserve0 && pairInfo.reserve1 
                      ? formatExchangeRate(
                          parseFloat(pairInfo.reserve0) / parseFloat(pairInfo.reserve1),
                          'tEXT',
                          tokenInfo?.symbol || ''
                        )
                      : `1 tEXT = 1 ${tokenInfo?.symbol || ''}`}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">Pool Share</span>
                  <span className="font-medium text-[var(--text-primary)]">{estimatedPoolShare}</span>
          </div>
              </>
            )}
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-secondary)]">Slippage Tolerance</span>
            <span className="font-medium text-[var(--text-primary)]">{slippage}%</span>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="bg-[var(--hover)] dark:bg-[var(--bg-primary)] rounded-lg p-4 mt-6 text-center">
          <p className="text-[var(--text-secondary)] text-sm mb-2">
            Connect your wallet to add liquidity
          </p>
        </div>
      )}

        {hasInsufficientBalance && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mt-4">
            <p className="text-orange-600 dark:text-orange-400 text-sm">
              ⚠️ Insufficient balance
          </p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <button 
          onClick={handleAddLiquidityClick}
            disabled={isConnecting || isLoading || (isConnected && (!hasValidAmounts || hasInsufficientBalance || !isValidNetwork))}
            className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white py-3 px-4 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isConnecting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            </div>
          ) : !isConnected ? (
            'Connect Wallet'
            ) : !isValidNetwork ? (
              'Wrong Network'
            ) : !tokenAddress ? (
              'Select Token'
            ) : !hasValidAmounts ? (
              'Enter Amounts'
            ) : hasInsufficientBalance ? (
              'Insufficient Balance'
          ) : (
            'Add Liquidity'
          )}
        </button>
      </div>
      
      <p className="text-xs text-[var(--text-tertiary)] mt-4 text-center">
        By adding liquidity you'll earn 0.3% of all trades on this pair proportional to your share of the pool.
      </p>
    </div>
      
      <AddLiquidityConfirmModal
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmAddLiquidity}
        onSuccess={handleAddLiquiditySuccess}
        isLoading={isAddingLiquidity}
        error={liquidityError}
        onRetry={handleRetryAddLiquidity}
        onClearError={handleClearLiquidityError}
        textAmount={textAmount}
        tokenAmount={tokenAmount}
        tokenSymbol={tokenInfo?.symbol || 'TOKEN'}
        exchangeRate={
          !isNewPair && pairInfo?.reserve0 && pairInfo?.reserve1 
            ? formatExchangeRate(
                parseFloat(pairInfo.reserve0) / parseFloat(pairInfo.reserve1),
                'tEXT',
                tokenInfo?.symbol || ''
              )
            : '1 tEXT = 1 Token'
        }
        poolShare={estimatedPoolShare}
        slippage={slippage}
        isNewPair={isNewPair}
        lpTokenAmount={lpTokenAmount}
      />
    </>
  );
};

export default AddLiquidityForm; 