"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import TokenSelector from '../UI/TokenSelector';
import TransactionSettingsModal from '../UI/TransactionSettingsModal';
import SwapConfirmModal from './SwapConfirmModal';

import { useExtSwap } from '@/hooks/useExtSwap';
import { useWallet } from '@/context/WalletContext';
import { RPC_CONFIG } from '../../utils/config';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import { LiquidityPositionsRef } from './LiquidityPositions';
import {
  formatTokenDisplay,
  formatTokenInput,
  formatExchangeRate,
  formatPercentage
} from '@/utils/tokenFormatter';
import {
  EXTSWAP_CONTRACTS,
  getFactoryContract
} from '@/utils/contracts';
import { useResponsive } from '@/hooks/useResponsive';
import { TOUCH_TARGETS } from '@/utils/responsive';

interface SwapFormProps {
  liquidityPositionsRef?: React.RefObject<LiquidityPositionsRef | null>;
  onPairAddressChange?: (pairAddress: string) => void;
  initialTokenIn?: string;
  initialTokenOut?: string;
}

const SwapForm: React.FC<SwapFormProps> = ({
  liquidityPositionsRef,
  onPairAddressChange,
  initialTokenIn = 'text',
  initialTokenOut = ''
}) => {
  const router = useRouter();
  const [tokenIn, setTokenIn] = useState(initialTokenIn);
  const [tokenOut, setTokenOut] = useState(initialTokenOut);
  const [tokenInAddress, setTokenInAddress] = useState<string>('');
  const [tokenOutAddress, setTokenOutAddress] = useState<string>('');


  useEffect(() => {

    if (tokenIn !== initialTokenIn || tokenOut !== initialTokenOut) {
      if (tokenOut) {
        router.replace(`/swap/${tokenIn}/${tokenOut}`, { scroll: false });
      } else if (tokenIn) {
        router.replace(`/swap/${tokenIn}`, { scroll: false });
      }
    }
  }, [tokenIn, tokenOut, initialTokenIn, initialTokenOut, router]);


  useEffect(() => {
    if (initialTokenIn && initialTokenIn !== 'text') {
      setTokenInAddress(initialTokenIn);
    }
    if (initialTokenOut && initialTokenOut !== 'text') {
      setTokenOutAddress(initialTokenOut);
    }
  }, [initialTokenIn, initialTokenOut]);

  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [deadline, setDeadline] = useState('20');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState<string | null>(null);

  interface TokenInfo {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    balance: string;
  }

  interface SwapQuote {
    amountIn: string;
    amountOut: string;
    priceImpact: string;
    route: string[];
    isValid: boolean;
  }

  const [tokenInInfo, setTokenInInfo] = useState<TokenInfo | null>(null);
  const [tokenOutInfo, setTokenOutInfo] = useState<TokenInfo | null>(null);
  const [textBalance, setTextBalance] = useState('0');
  const [swapQuote, setSwapQuote] = useState<SwapQuote | null>(null);

  const { isConnected, connectWallet, isInitializing } = useWallet();
  const {
    isValidNetwork,
    getTokenInfo,
    getTEXTBalance,
    getSwapQuote,
    executeSwap,
    error,
    clearError
  } = useExtSwap();
  const { calculateUSDValue, formatUSDDisplay, loading: priceLoading } = useTokenPrice();
  const { isMobile } = useResponsive();

  // Define callback functions first
  const loadTokenInfo = useCallback(async () => {
    try {
      if (tokenOutAddress) {
        const info = await getTokenInfo(tokenOutAddress);
        setTokenOutInfo(info);
      } else {
        setTokenOutInfo(null);
      }
      if (tokenInAddress) {
        const info = await getTokenInfo(tokenInAddress);
        setTokenInInfo(info);
      } else if (tokenIn === 'text') {
        setTokenInInfo(null);
      }
    } catch (err) {
      console.error('Failed to load token info:', err);
    }
  }, [tokenOutAddress, tokenInAddress, tokenIn, getTokenInfo]);

  const loadBalances = useCallback(async () => {
    try {
      const balance = await getTEXTBalance();
      setTextBalance(balance);
    } catch (err) {
      console.error('Failed to load balances:', err);
    }
  }, [getTEXTBalance]);

  // Now use the functions in useEffect
  useEffect(() => {
    if (isConnected && isValidNetwork) {
      loadTokenInfo();
      loadBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isValidNetwork, tokenIn, tokenOut]);

  useEffect(() => {
    if (amountIn && parseFloat(amountIn) > 0) {
      getQuote();
    } else {
      setAmountOut('');
      setSwapQuote(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountIn, tokenIn, tokenOut]);

  useEffect(() => {
    const getPairAddress = async () => {
      if (!tokenIn || !tokenOut) {
        if (onPairAddressChange) onPairAddressChange('');
        return;
      }

      try {
        const tokenInAddr = tokenIn === 'text' ? EXTSWAP_CONTRACTS.WTEXT : tokenInAddress;
        const tokenOutAddr = tokenOut === 'text' ? EXTSWAP_CONTRACTS.WTEXT : tokenOutAddress;

        if (!tokenInAddr || !tokenOutAddr) {
          if (onPairAddressChange) onPairAddressChange('');
          return;
        }

        const provider = window.ethereum
          ? new ethers.BrowserProvider(window.ethereum)
          : new ethers.JsonRpcProvider(RPC_CONFIG.EXATECH);

        const factory = getFactoryContract(provider);

        try {
          const pairAddress = await factory.getFunction('getPair')(tokenInAddr, tokenOutAddr);

          if (pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000') {
            if (onPairAddressChange) onPairAddressChange(pairAddress);
          } else {
            if (onPairAddressChange) onPairAddressChange('');
          }
        } catch {

          if (onPairAddressChange) onPairAddressChange('');
        }
      } catch (error) {
        console.error('Failed to get pair address:', error);
        if (onPairAddressChange) onPairAddressChange('');
      }
    };

    getPairAddress();
  }, [tokenIn, tokenOut, tokenInAddress, tokenOutAddress, onPairAddressChange]);

  const getQuote = useCallback(async () => {
    if (!amountIn || parseFloat(amountIn) <= 0 || !tokenOut) return;

    const needsTokenInAddress = tokenIn !== 'text' && !tokenInAddress;
    const needsTokenOutAddress = tokenOut !== 'text' && !tokenOutAddress;

    if (needsTokenInAddress || needsTokenOutAddress) {
      return;
    }

    setIsLoading(true);
    try {
      const tokenInAddr = tokenIn === 'text' ? 'tEXT' : tokenInAddress;
      const tokenOutAddr = tokenOut === 'text' ? 'tEXT' : tokenOutAddress;

      const quote = await getSwapQuote(tokenInAddr, tokenOutAddr, amountIn);
      setSwapQuote(quote);

      if (quote.isValid) {
        setAmountOut(formatTokenInput(quote.amountOut));
      } else {
        setAmountOut('0');
      }
    } catch (err) {
      console.error('Failed to get quote:', err);
      setAmountOut('0');
      setSwapQuote(null);
    } finally {
      setIsLoading(false);
    }
  }, [amountIn, tokenIn, tokenOut, tokenInAddress, tokenOutAddress, getSwapQuote]);

  const handleAmountInChange = (amount: string) => {
    setAmountIn(amount);
  };

  const handleTokenInChange = (newTokenId: string) => {
    if (newTokenId === tokenOut) {
      setTokenOut(tokenIn);
      setTokenOutAddress(tokenInAddress);
    }
    setTokenIn(newTokenId);
    setAmountIn('');
    setAmountOut('');

    if (newTokenId === 'text') {
      setTokenInAddress('');
    } else if (newTokenId.startsWith('0x')) {
      setTokenInAddress(newTokenId);
      if (liquidityPositionsRef?.current) {
        liquidityPositionsRef.current.addUserToken(newTokenId);
      }
    } else {
      setTokenInAddress('');
    }
  };

  const handleTokenOutChange = (newTokenId: string) => {
    if (newTokenId === tokenIn) {
      setTokenIn(tokenOut);
      setTokenInAddress(tokenOutAddress);
    }
    setTokenOut(newTokenId);
    setAmountIn('');
    setAmountOut('');

    if (newTokenId === 'text') {
      setTokenOutAddress('');
    } else if (newTokenId.startsWith('0x')) {
      setTokenOutAddress(newTokenId);
      if (liquidityPositionsRef?.current) {
        liquidityPositionsRef.current.addUserToken(newTokenId);
      }
      loadTokenInfo();
    } else {
      setTokenOutAddress('');
    }
  };

  const handleSwapTokens = () => {
    if (!tokenOut) return;

    const tempToken = tokenIn;
    const tempTokenAddress = tokenInAddress;
    const tempAmount = amountIn;

    setTokenIn(tokenOut);
    setTokenInAddress(tokenOutAddress);
    setTokenOut(tempToken);
    setTokenOutAddress(tempTokenAddress);
    setAmountIn(amountOut);
    setAmountOut(tempAmount);
  };

  const handleMaxClick = () => {
    if (!isConnected) return;

    if (tokenIn === 'text') {
      const maxAmount = Math.max(0, parseFloat(textBalance) - 0.01);
      handleAmountInChange(formatTokenInput(maxAmount));
    } else if (tokenInInfo) {
      handleAmountInChange(formatTokenInput(tokenInInfo.balance));
    }
  };

  const handleSwapClick = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }

    if (!isValidNetwork) {
      return;
    }

    if (!swapQuote || !swapQuote.isValid) {
      return;
    }

    handleOpenConfirm();
  };

  const handleConfirmSwap = async () => {
    try {
      setIsSwapping(true);
      setSwapError(null);

      const tokenInAddr = tokenIn === 'text' ? 'tEXT' : tokenInAddress;
      const tokenOutAddr = tokenOut === 'text' ? 'tEXT' : tokenOutAddress;

      await executeSwap({
        tokenIn: tokenInAddr,
        tokenOut: tokenOutAddr,
        amountIn,
        slippage,
        isExactIn: true
      });

      setAmountIn('');
      setAmountOut('');
      setSwapError(null);
      await loadBalances();
      await loadTokenInfo();
      clearError();

      return Promise.resolve();
    } catch (err: unknown) {
      console.error('Swap failed:', err);
      setSwapError(err instanceof Error ? err.message : 'Failed to execute swap');
      throw err;
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwapSuccess = () => {
  };

  const handleRetrySwap = () => {
    setSwapError(null);
    handleConfirmSwap();
  };

  const handleClearSwapError = () => {
    setSwapError(null);
  };

  const handleOpenConfirm = () => {
    setSwapError(null);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setSwapError(null);
    clearError();
  };

  const handleSlippageChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      setSlippage(numValue);
    }
  };

  const handleDeadlineChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 1440) {
      setDeadline(value);
    }
  };

  const getTokenInBalance = () => {
    if (tokenIn === 'text') return textBalance;
    if (tokenInInfo) return tokenInInfo.balance;
    return '0';
  };

  const getTokenOutBalance = () => {
    if (!tokenOut) return '0';
    if (tokenOut === 'text') return textBalance;
    if (tokenOutInfo) return tokenOutInfo.balance;
    return '0';
  };

  const getTokenInSymbol = () => {
    if (tokenIn === 'text') return 'tEXT';
    if (tokenInInfo) return tokenInInfo.symbol;
    return '';
  };

  const getTokenOutSymbol = () => {
    if (!tokenOut) return '';
    if (tokenOut === 'text') return 'tEXT';
    if (tokenOutInfo) return tokenOutInfo.symbol;
    return '';
  };

  const getMinimumReceived = () => {
    if (!amountOut) return '0';
    const amount = parseFloat(amountOut);
    const minAmount = amount * (1 - slippage / 100);
    return minAmount.toString();
  };


  const getTokenInUSDValue = () => {
    if (!amountIn || parseFloat(amountIn) === 0 || priceLoading) return null;


    const usdValue = calculateUSDValue(amountIn);
    return formatUSDDisplay(usdValue);
  };

  const getTokenOutUSDValue = () => {
    if (!amountOut || parseFloat(amountOut) === 0 || priceLoading) return null;


    const usdValue = calculateUSDValue(amountOut);
    return formatUSDDisplay(usdValue);
  };

  const getBalanceUSDValue = (isTokenIn: boolean) => {
    if (priceLoading) return null;

    const balance = isTokenIn ? getTokenInBalance() : getTokenOutBalance();

    if (balance && parseFloat(balance) > 0) {
      const usdValue = calculateUSDValue(balance);
      return formatUSDDisplay(usdValue);
    }
    return null;
  };

  const hasValidAmounts = amountIn && amountOut && parseFloat(amountIn) > 0 && parseFloat(amountOut) > 0 && tokenOut;
  const hasInsufficientBalance = parseFloat(amountIn) > parseFloat(getTokenInBalance());
  const priceImpactHigh = swapQuote && parseFloat(swapQuote.priceImpact) > 5;

  return (
    <>
      <div className={`card ${isMobile ? 'p-4' : 'p-6'} max-w-lg mx-auto shadow-lg`}>
        <div className={`flex justify-between items-center ${isMobile ? 'mb-4' : 'mb-6'}`}>
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-[var(--text-primary)]`}>Swap</h2>
          <div className="text-sm text-[var(--text-secondary)]">
            <button
              className={`text-[var(--primary)] hover:underline cursor-pointer ${TOUCH_TARGETS.minimum} flex items-center justify-center`}
              onClick={() => setIsSettingsOpen(true)}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

        {isConnected && !isValidNetwork && !isInitializing && (
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

        <div className={`${isMobile ? 'space-y-5' : 'space-y-4'}`}>
          <TokenSelector
            label="From"
            value={tokenIn}
            onChange={handleTokenInChange}
            balance={isConnected && isValidNetwork ? formatTokenDisplay(getTokenInBalance(), getTokenInSymbol()) : '--'}
            balanceUSD={isConnected && isValidNetwork ? getBalanceUSDValue(true) : null}
            amount={amountIn}
            amountUSD={getTokenInUSDValue()}
            onAmountChange={handleAmountInChange}
            onMaxClick={handleMaxClick}
            disabled={false}
          />

          <div className={`flex justify-center ${isMobile ? 'py-2' : ''}`}>
            <button
              onClick={handleSwapTokens}
              className={`${TOUCH_TARGETS.minimum} bg-[var(--hover)] hover:bg-[var(--primary)]/10 rounded-xl border border-[var(--card-border)] transition-colors cursor-pointer group flex items-center justify-center`}
              title="Flip tokens"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          <TokenSelector
            label="To"
            value={tokenOut}
            onChange={handleTokenOutChange}
            balance={isConnected && isValidNetwork ? formatTokenDisplay(getTokenOutBalance(), getTokenOutSymbol()) : '--'}
            balanceUSD={isConnected && isValidNetwork ? getBalanceUSDValue(false) : null}
            amount={amountOut}
            amountUSD={getTokenOutUSDValue()}
            onAmountChange={() => { }}
            disabled={false}
          />
        </div>
        {swapQuote && swapQuote.isValid && tokenOut && (
          <div className="bg-[var(--hover)] rounded-lg p-4 mt-6 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-secondary)]">Exchange Rate</span>
              <span className="font-medium text-[var(--text-primary)]">
                {getTokenInSymbol() && getTokenOutSymbol() ?
                  formatExchangeRate(
                    parseFloat(amountOut) / parseFloat(amountIn),
                    getTokenInSymbol(),
                    getTokenOutSymbol()
                  ) : 'Select tokens to see rate'
                }
              </span>
            </div>

            {parseFloat(swapQuote.priceImpact) > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--text-secondary)]">Price Impact</span>
                <span className={`font-medium ${parseFloat(swapQuote.priceImpact) > 5
                  ? 'text-red-500'
                  : parseFloat(swapQuote.priceImpact) > 2
                    ? 'text-orange-500'
                    : 'text-[var(--text-primary)]'
                  }`}>
                  {formatPercentage(swapQuote.priceImpact)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-secondary)]">Slippage Tolerance</span>
              <span className="font-medium text-[var(--text-primary)]">{slippage}%</span>
            </div>
          </div>
        )}
        {priceImpactHigh && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-4">
            <p className="text-red-600 dark:text-red-400 text-sm">
              ⚠️ High price impact ({formatPercentage(swapQuote.priceImpact)}). Consider reducing swap amount.
            </p>
          </div>
        )}
        {hasInsufficientBalance && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mt-4">
            <p className="text-orange-600 dark:text-orange-400 text-sm">
              ⚠️ Insufficient {getTokenInSymbol()} balance
            </p>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={handleSwapClick}
            disabled={
              isLoading ||
              (isConnected && (!hasValidAmounts || hasInsufficientBalance || !isValidNetwork || !swapQuote?.isValid))
            }
            className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white py-3 px-4 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {swapQuote ? 'Getting Quote...' : 'Loading...'}
              </div>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : !isValidNetwork ? (
              'Wrong Network'
            ) : !tokenOut ? (
              'Select Token'
            ) : !hasValidAmounts ? (
              'Enter Amount'
            ) : hasInsufficientBalance ? (
              'Insufficient Balance'
            ) : !swapQuote?.isValid ? (
              'No Liquidity'
            ) : (
              'Swap'
            )}
          </button>
        </div>

        <p className="text-xs text-[var(--text-tertiary)] mt-4 text-center">
          Swaps are executed with minimal slippage and automatic routing for the best price.
        </p>
      </div>
      <TransactionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        slippage={slippage.toString()}
        onSlippageChange={handleSlippageChange}
        deadline={deadline}
        onDeadlineChange={handleDeadlineChange}
      />
      <SwapConfirmModal
        isOpen={isConfirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmSwap}
        onSuccess={handleSwapSuccess}
        isLoading={isSwapping}
        tokenInSymbol={getTokenInSymbol()}
        tokenOutSymbol={getTokenOutSymbol()}
        amountIn={amountIn}
        amountOut={amountOut}
        amountInUSD={getTokenInUSDValue()}
        amountOutUSD={getTokenOutUSDValue()}
        exchangeRate={getTokenInSymbol() && getTokenOutSymbol() ?
          formatExchangeRate(
            parseFloat(amountOut) / parseFloat(amountIn),
            getTokenInSymbol(),
            getTokenOutSymbol()
          ) : 'Rate unavailable'
        }
        priceImpact={swapQuote?.priceImpact || '0'}
        slippage={slippage}
        deadline={deadline}
        minimumReceived={getMinimumReceived()}
        error={swapError}
        onRetry={handleRetrySwap}
        onClearError={handleClearSwapError}
      />
    </>
  );
};

export default SwapForm; 