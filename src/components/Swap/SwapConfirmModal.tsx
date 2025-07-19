"use client"

import React, { useEffect, useState } from 'react';
import {
  formatTokenDisplay,
  formatPercentage,
  formatCompactPrice
} from '@/utils/tokenFormatter';

interface SwapConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onClearError?: () => void;
  onSuccess?: () => void;
  tokenInSymbol: string;
  tokenOutSymbol: string;
  amountIn: string;
  amountOut: string;
  amountInUSD?: string | null;
  amountOutUSD?: string | null;
  exchangeRate: string;
  priceImpact: string;
  slippage: number;
  deadline: string;
  minimumReceived: string;
}

const SwapConfirmModal: React.FC<SwapConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  error,
  onRetry,
  onClearError,
  onSuccess,
  tokenInSymbol,
  tokenOutSymbol,
  amountIn,
  amountOut,
  amountInUSD,
  amountOutUSD,
  exchangeRate,
  priceImpact,
  slippage,
  deadline,
  minimumReceived,
}) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [successTimestamp, setSuccessTimestamp] = useState<number | null>(null);

  const [successSwapData, setSuccessSwapData] = useState<{
    amountIn: string;
    amountOut: string;
    tokenInSymbol: string;
    tokenOutSymbol: string;
    exchangeRate: string;
  } | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      const now = Date.now();
      const shouldReset = !successTimestamp || (now - successTimestamp > 3000);

      if (shouldReset) {
        setIsSuccess(false);
        setSuccessTimestamp(null);
        setSuccessSwapData(null);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isLoading, successTimestamp]);

  const handleSuccess = () => {
    setSuccessSwapData({
      amountIn,
      amountOut,
      tokenInSymbol,
      tokenOutSymbol,
      exchangeRate
    });

    setIsSuccess(true);
    setSuccessTimestamp(Date.now());
  };

  const handleCloseAfterSuccess = () => {
    setIsSuccess(false);
    setSuccessTimestamp(null);
    setSuccessSwapData(null);

    if (onSuccess) {
      onSuccess();
    }

    onClose();
  };

  const handleClearSwapError = () => {
    if (onClearError) {
      onClearError();
    }
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
      return 'Token approval required or insufficient allowance';
    }

    if (lowerError.includes('execution reverted') ||
      lowerError.includes('unknown custom error')) {
      return 'Smart contract execution failed. Please check your swap parameters and try again.';
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

  const handleConfirmClick = async () => {
    try {
      await onConfirm();
      handleSuccess();
    } catch (err) {
      // Error is handled by the parent component through error prop
      console.error('Swap confirmation failed:', err);
    }
  };

  if (!isOpen) return null;

  const priceImpactNum = parseFloat(priceImpact);
  const isHighImpact = priceImpactNum > 5;
  const isMediumImpact = priceImpactNum > 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
        onClick={!isLoading ? onClose : undefined}
      ></div>

      <div className="relative w-full max-w-md mx-4 card p-0 shadow-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)] bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            {isSuccess ? 'Swap Successful' : 'Confirm Swap'}
          </h3>
          {!isLoading && (
            <button
              onClick={isSuccess ? handleCloseAfterSuccess : onClose}
              className="p-1.5 hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-secondary)]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  Swap Successful!
                </h3>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  Your tokens have been swapped successfully
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[var(--text-primary)] mb-1">
                      {formatTokenDisplay(successSwapData?.amountIn || amountIn, '')}
                    </div>
                    <div className="text-[var(--text-secondary)] text-sm font-medium">
                      {successSwapData?.tokenInSymbol || tokenInSymbol}
                    </div>
                    {amountInUSD && (
                      <div className="text-xs text-[var(--text-tertiary)] mt-1">
                        ≈ <span dangerouslySetInnerHTML={{ __html: formatCompactPrice(amountInUSD) }}></span>
                      </div>
                    )}
                  </div>

                  <div className="mx-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
                      {formatTokenDisplay(successSwapData?.amountOut || amountOut, '')}
                    </div>
                    <div className="text-[var(--text-secondary)] text-sm font-medium">
                      {successSwapData?.tokenOutSymbol || tokenOutSymbol}
                    </div>
                    {amountOutUSD && (
                      <div className="text-xs text-[var(--text-tertiary)] mt-1">
                        ≈ <span dangerouslySetInnerHTML={{ __html: formatCompactPrice(amountOutUSD) }}></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-green-500/20 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Exchange Rate:</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {successSwapData?.exchangeRate || exchangeRate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--hover)] rounded-lg p-3">
                <p className="text-xs text-[var(--text-secondary)] text-center">
                  🎉 Your {successSwapData?.tokenOutSymbol || tokenOutSymbol} tokens should appear in your wallet shortly
                </p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-red-600 dark:text-red-400 font-medium text-sm mb-1">
                        Transaction Failed
                      </h4>
                      <p className="text-red-600 dark:text-red-400 text-sm break-words">
                        {parseErrorMessage(error || '')}
                      </p>
                      {onClearError && (
                        <button
                          onClick={handleClearSwapError}
                          className="text-red-600 dark:text-red-400 text-xs underline mt-2 hover:opacity-80 cursor-pointer"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[var(--hover)] rounded-xl p-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                      {formatTokenDisplay(amountIn, '')}
                    </div>
                    <div className="text-[var(--text-secondary)] text-sm font-medium">
                      {tokenInSymbol}
                    </div>
                    {amountInUSD && (
                      <div className="text-xs text-[var(--text-tertiary)] mt-1">
                        ≈ <span dangerouslySetInnerHTML={{ __html: formatCompactPrice(amountInUSD) }}></span>
                      </div>
                    )}
                  </div>

                  <div className="mx-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                      {formatTokenDisplay(amountOut, '')}
                    </div>
                    <div className="text-[var(--text-secondary)] text-sm font-medium">
                      {tokenOutSymbol}
                    </div>
                    {amountOutUSD && (
                      <div className="text-xs text-[var(--text-tertiary)] mt-1">
                        ≈ <span dangerouslySetInnerHTML={{ __html: formatCompactPrice(amountOutUSD) }}></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">Rate</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {exchangeRate}
                  </span>
                </div>

                {priceImpactNum > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--text-secondary)]">Price Impact</span>
                    <span className={`font-medium ${isHighImpact
                        ? 'text-red-500'
                        : isMediumImpact
                          ? 'text-orange-500'
                          : 'text-[var(--text-primary)]'
                      }`}>
                      {formatPercentage(priceImpact)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">Slippage Tolerance</span>
                  <span className="font-medium text-[var(--text-primary)]">{slippage}%</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">Minimum Received</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {formatTokenDisplay(minimumReceived, tokenOutSymbol)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">Transaction Deadline</span>
                  <span className="font-medium text-[var(--text-primary)]">{deadline} minutes</span>
                </div>
              </div>

              {isHighImpact && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <div className="font-medium">High Price Impact!</div>
                      <div className="text-xs">This swap has a price impact of {formatPercentage(priceImpact)}. You may receive significantly less tokens than expected.</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t border-[var(--card-border)] bg-[var(--hover)]/30">
          <div className="space-y-3">
            {isSuccess ? (
              <button
                onClick={handleCloseAfterSuccess}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-medium transition cursor-pointer"
              >
                Close
              </button>
            ) : error ? (
              <>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white py-3 px-4 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full bg-[var(--hover)] hover:bg-[var(--card-border)] text-[var(--text-primary)] py-3 px-4 rounded-xl font-medium transition cursor-pointer"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleConfirmClick}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white py-3 px-4 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Confirming Swap...
                    </div>
                  ) : (
                    'Confirm Swap'
                  )}
                </button>

                {!isLoading && (
                  <button
                    onClick={onClose}
                    className="w-full bg-[var(--hover)] hover:bg-[var(--card-border)] text-[var(--text-primary)] py-3 px-4 rounded-xl font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </>
            )}
          </div>

          {!isSuccess && (
            <p className="text-xs text-[var(--text-tertiary)] mt-3 text-center">
              Output is estimated. You will receive at least {formatTokenDisplay(minimumReceived, tokenOutSymbol)} or the transaction will revert.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwapConfirmModal; 