"use client"

import React, { useState, useEffect } from 'react';
import { useExtSwap } from '@/hooks/useExtSwap';
import { formatTokenDisplay } from '@/utils/tokenFormatter';
import TokenLogo from '../UI/TokenLogo';

interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
}

interface PairInfo {
  address: string;
  token0?: string;
  token1?: string;
  reserve0?: string;
  reserve1?: string;
  lpBalance?: string;
  totalSupply?: string;
  exists: boolean;
}

interface LiquidityPosition {
  pairAddress: string;
  tokenAddress: string;
  tokenInfo: TokenInfo;
  pairInfo: PairInfo;
  lpBalance: string;
  token0Amount: string;
  token1Amount: string;
  sharePercentage: string;
  totalValue: string;
  textLogoUrl?: string;
  tokenLogoUrl?: string;
}

interface RemoveLiquidityModalProps {
  position: LiquidityPosition | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RemoveLiquidityModal: React.FC<RemoveLiquidityModalProps> = ({
  position,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [removePercentage, setRemovePercentage] = useState(25);
  const [slippage, setSlippage] = useState(0.5);
  const [isCustomPercentage, setIsCustomPercentage] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { removeLiquidity, isLoading, error, clearError } = useExtSwap();

  useEffect(() => {
    if (isOpen) {
      // Only reset these states, not the percentage
      setRemoveError(null);
      setIsSuccess(false);
      clearError();
    }
  }, [isOpen, clearError]);

  if (!isOpen || !position) return null;

  const liquidityToRemove = (parseFloat(position.lpBalance) * removePercentage / 100).toString();
  const tokenToReceive = (parseFloat(position.token0Amount) * removePercentage / 100).toString();
  const textToReceive = (parseFloat(position.token1Amount) * removePercentage / 100).toString();

  const handleRemove = async () => {
    try {
      setIsRemoving(true);
      setRemoveError(null);
      
      await removeLiquidity({
        tokenAddress: position.tokenAddress,
        liquidity: liquidityToRemove,
        slippage
      });

      setIsSuccess(true);
      setRemoveError(null);
      clearError();
      
      onSuccess();
    } catch (err: unknown) {
      console.error('Remove liquidity failed:', err);
      setRemoveError(err instanceof Error ? err.message : 'Failed to remove liquidity');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCloseAfterSuccess = () => {
    setIsSuccess(false);
    onClose();
  };

  const handleRetryRemove = () => {
    setRemoveError(null);
    handleRemove();
  };

  const handleClearRemoveError = () => {
    setRemoveError(null);
  };

  const parseErrorMessage = (errorMessage: string): string => {
    if (!errorMessage) return 'An unknown error occurred';
    
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('rejected') || 
        lowerError.includes('denied') || 
        lowerError.includes('cancelled') ||
        lowerError.includes('user rejected')) {
      return 'Transaction was rejected by user in wallet';
    }
    
    if (lowerError.includes('insufficient funds') ||
        lowerError.includes('insufficient balance')) {
      return 'Insufficient funds for transaction';
    }
    
    if (lowerError.includes('allowance') ||
        lowerError.includes('approval') ||
        lowerError.includes('transfer amount exceeds allowance')) {
      return 'LP token approval required or insufficient allowance';
    }
    
    if (lowerError.includes('execution reverted') ||
        lowerError.includes('unknown custom error')) {
      return 'Smart contract execution failed. Please check your liquidity position and try again.';
    }

    if (lowerError.includes('slippage') ||
        lowerError.includes('price impact')) {
      return 'Transaction failed due to slippage. Try increasing slippage tolerance.';
    }
    
    if (lowerError.includes('gas') ||
        lowerError.includes('estimate')) {
      return 'Gas estimation failed. Please check your transaction parameters.';
    }
    
    if (lowerError.includes('network') ||
        lowerError.includes('connection')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    return 'Transaction failed. Please try again or contact support if the problem persists.';
  };

  const percentageButtons = [25, 50, 75, 100];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--background)] rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">Remove Liquidity</h3>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-[var(--hover)] rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center -space-x-2">
              <TokenLogo
                logoUrl={position.textLogoUrl}
                symbol="tEXT"
                size={32}
                className="border-2 border-white dark:border-gray-800 shadow-lg z-10"
              />
              <TokenLogo
                logoUrl={position.tokenLogoUrl}
                symbol={position.tokenInfo.symbol}
                size={32}
                className="border-2 border-white dark:border-gray-800 shadow-lg"
              />
            </div>
            <div>
              <h4 className="font-bold text-[var(--text-primary)]">
                tEXT / {position.tokenInfo.symbol}
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Your LP Balance: {formatTokenDisplay(position.lpBalance, 'EXT-LP')}
              </p>
            </div>
          </div>
        </div>

        {isSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="flex-1 min-w-0">
                <h4 className="text-green-600 dark:text-green-400 font-medium text-sm mb-1">
                  Transaction Successful!
                </h4>
                <p className="text-green-600 dark:text-green-400 text-sm">
                  {removePercentage}% of your liquidity has been removed successfully. You should see the tokens in your wallet shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {(error || removeError) && !isSuccess && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <h4 className="text-red-600 dark:text-red-400 font-medium text-sm mb-1">
                  Transaction Failed
                </h4>
                <p className="text-red-600 dark:text-red-400 text-sm break-words">
                  {parseErrorMessage(error || removeError || '')}
                </p>
                <button 
                  onClick={removeError ? handleClearRemoveError : clearError}
                  className="text-red-600 dark:text-red-400 text-xs underline mt-2 hover:opacity-80 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
            Amount to Remove
          </label>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {percentageButtons.map((pct) => (
              <button
                key={pct}
                onClick={() => {
                  setRemovePercentage(pct);
                  setIsCustomPercentage(false);
                }}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition cursor-pointer ${
                  removePercentage === pct && !isCustomPercentage
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--hover)] text-[var(--text-primary)] hover:bg-[var(--primary)]/10'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          <div className="mb-4">
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={removePercentage}
              onChange={(e) => {
                const newValue = parseInt(e.target.value);
                setRemovePercentage(newValue);
                // Check if the new value matches any of the preset buttons
                const isPresetValue = percentageButtons.includes(newValue);
                setIsCustomPercentage(!isPresetValue);
              }}
              className="w-full h-2 bg-[var(--hover)] rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${removePercentage}%, var(--hover) ${removePercentage}%, var(--hover) 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
              <span>1%</span>
              <span className="font-medium text-[var(--text-primary)]">{removePercentage}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 mb-6">
          <h4 className="font-medium text-[var(--text-primary)] mb-3">You will receive:</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">tEXT</span>
              <span className="font-medium text-[var(--text-primary)]">
                {formatTokenDisplay(textToReceive, 'tEXT')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">{position.tokenInfo.symbol}</span>
              <span className="font-medium text-[var(--text-primary)]">
                {formatTokenDisplay(tokenToReceive, position.tokenInfo.symbol)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Slippage Tolerance
            </label>
            <span className="text-sm text-[var(--text-secondary)]">{slippage}%</span>
          </div>
          <div className="flex gap-2">
            {[0.1, 0.5, 1.0].map((pct) => (
              <button
                key={pct}
                onClick={() => setSlippage(pct)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  slippage === pct
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--hover)] text-[var(--text-primary)] hover:bg-[var(--primary)]/10'
                }`}
              >
                {pct}%
              </button>
            ))}
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="50"
              value={slippage}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow numbers and decimal point
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue) && numValue >= 0.1 && numValue <= 50) {
                    setSlippage(numValue);
                  } else if (value === '') {
                    setSlippage(0.5);
                  }
                }
              }}
              onKeyDown={(e) => {
                // Prevent non-numeric characters except backspace, delete, tab, escape, enter, and decimal point
                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '.', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className="px-3 py-2 bg-[var(--hover)] border border-[var(--card-border)] rounded-lg text-sm text-[var(--text-primary)] w-20"
              placeholder="Custom"
            />
          </div>
        </div>

        <div className="flex gap-3">
          {isSuccess ? (
            <button
              onClick={handleCloseAfterSuccess}
              className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition cursor-pointer"
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={isLoading || isRemoving}
                className="flex-1 py-3 px-4 border border-[var(--card-border)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--hover)] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(error || removeError) ? 'Close' : 'Cancel'}
              </button>
              
              {(error || removeError) ? (
                <button
                  onClick={handleRetryRemove}
                  disabled={isLoading || isRemoving || removePercentage === 0}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Try Again
                </button>
              ) : (
                <button
                  onClick={handleRemove}
                  disabled={isLoading || isRemoving || removePercentage === 0}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(isLoading || isRemoving) ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Removing...
                    </div>
                  ) : (
                    'Remove Liquidity'
                  )}
                </button>
              )}
            </>
          )}
        </div>

        <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
          <p className="text-orange-600 dark:text-orange-400 text-xs">
            ⚠️ Removing liquidity will burn your LP tokens and you&apos;ll receive the underlying tokens. 
            This action cannot be undone.
          </p>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default RemoveLiquidityModal; 