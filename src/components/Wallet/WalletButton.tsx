"use client"

import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { getNetworkCurrencySymbol } from '@/utils/networks';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import WalletModal from './WalletModal';

interface WalletButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  mobileCompact?: boolean;
}

const WalletButton: React.FC<WalletButtonProps> = ({ 
  size = 'md', 
  variant = 'primary',
  mobileCompact = false
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isConnected, walletAddress, isConnecting, disconnectWallet, balance, chainId } = useWallet();
  const { calculateUSDValue, formatUSDDisplay, getPriceChangeIndicator, loading: priceLoading } = useTokenPrice();

  const currencySymbol = getNetworkCurrencySymbol(chainId);

  const sizeClasses = {
    sm: mobileCompact ? 'px-2 py-1.5 text-xs' : 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white hover:opacity-90 shadow-md',
    secondary: 'bg-[var(--hover)] hover:bg-[var(--card-border)] text-[var(--text-primary)] border border-[var(--card-border)]',
    outline: 'border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10'
  };

  const formatAddress = (address: string) => {
    if (mobileCompact) {
      return `${address.slice(0, 4)}...${address.slice(-2)}`;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleClick = () => {
    if (isConnected) {
      setShowDropdown(!showDropdown);
    } else {
      setShowModal(true);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowDropdown(false);
  };

  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);

      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
    setShowDropdown(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={handleClick}
          disabled={isConnecting}
          className={`
            ${sizeClasses[size]} 
            ${variantClasses[variant]}
            rounded-lg font-medium transition-all duration-200 
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2
          `}
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : isConnected ? (
            mobileCompact ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex flex-col items-start">
                  <span className="text-xs">{formatAddress(walletAddress!)}</span>
                  {!priceLoading && balance && parseFloat(balance) > 0 && (
                    <span className="text-xs opacity-75">
                      {formatUSDDisplay(calculateUSDValue(balance))}
                    </span>
                  )}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            ) : (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>{formatAddress(walletAddress!)}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </>
            )
          ) : (
            mobileCompact ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-xs">Connect</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Connect Wallet
            </>
            )
          )}
        </button>

        {isConnected && showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowDropdown(false)}
            ></div>
            
            <div className={`absolute mt-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-lg z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200 ${
              mobileCompact 
                ? 'left-0 right-0 mx-auto w-[calc(100vw-3rem)] max-w-xs' 
                : 'right-0 w-64'
            }`} style={mobileCompact ? { 
              transform: 'translateX(-50%)', 
              left: '50%',
              right: 'auto'
            } : {}}>
              <div className="p-4 border-b border-[var(--card-border)] bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {walletAddress?.slice(2, 4).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] text-sm">
                      {formatAddress(walletAddress!)}
                    </p>
                    <div className="space-y-1">
                    <p className="text-xs text-[var(--text-secondary)]">
                      Balance: {balance} {currencySymbol}
                    </p>
                      {!priceLoading && balance && parseFloat(balance) > 0 && (
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-[var(--text-tertiary)]">
                            ≈ {formatUSDDisplay(calculateUSDValue(balance))}
                          </p>
                          {(() => {
                            const indicator = getPriceChangeIndicator();
                            return indicator && indicator.value !== '0.00' ? (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                indicator.value.startsWith("-") 
                                  ? 'bg-red-100 !text-red-700 dark:!bg-red-500/20 dark:!text-red-400'
                                  : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                              } flex items-center gap-0.5`}>
                                <span>{indicator.icon}</span>
                                <span>({indicator.sign}{indicator.value}%)</span>
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">
                                (0.00%)
                              </span>
                            );
                          })()}
                        </div>
                      )}
                      {priceLoading && (
                        <div className="flex items-center gap-1">
                          <svg className="animate-spin h-3 w-3 text-[var(--primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-xs text-[var(--text-secondary)]">Loading USD value...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                {chainId && (
                  <div className="mt-2 text-xs text-[var(--text-secondary)]">
                    Chain ID: {parseInt(chainId, 16)}
                  </div>
                )}
              </div>

              <div className="py-2">
                <button
                  onClick={copyAddress}
                  className="w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors flex items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Address
                </button>
                
                <button
                  onClick={() => {
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors flex items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View on Explorer
                </button>

                <hr className="my-2 border-[var(--card-border)]" />

                <button
                  onClick={handleDisconnect}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <WalletModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};

export default WalletButton; 