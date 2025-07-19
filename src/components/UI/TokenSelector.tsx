"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { formatCompactPrice } from '@/utils/tokenFormatter';
import { ethers } from 'ethers';
import { useWallet } from '@/context/WalletContext';
import { getERC20Contract, formatUnits } from '@/utils/contracts';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import SkeletonLoader from '@/components/UI/SkeletonLoader';
import { useTokenRegistry, TokenData } from '@/hooks/useTokenRegistry';
import TokenLogo from './TokenLogo';
import { API_CONFIG } from '@/utils/config';


const formatTokenPrice = (price: string | number): string => {

  const numeric = typeof price === 'string' ? parseFloat(String(price).replace(/[^0-9.-]/g, '')) : price;
  if (isNaN(numeric) || numeric === 0) return '$0.00';


  const trimZeros = (str: string) => str.replace(/\.?(0+)$/g, '');

  if (numeric < 0.000001) {

    return '$' + trimZeros(numeric.toFixed(10));
  }
  if (numeric < 0.0001) {

    return '$' + trimZeros(numeric.toFixed(8));
  }
  if (numeric < 0.01) {

    return '$' + trimZeros(numeric.toFixed(6));
  }

  return '$' + trimZeros(numeric.toFixed(4));
};

interface TokenSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  balance?: string;
  balanceUSD?: string | null;
  amount: string;
  amountUSD?: string | null;
  onAmountChange: (amount: string) => void;
  onMaxClick?: () => void;
  disabled?: boolean;
}



const defaultTokenDisplay = {
  id: 'default',
  symbol: 'Select',
  name: 'Select a token',
  balance: '0',
  price: '$0.00',
  isNative: false,
  change24h: '+0.00%',
  isPositive: true,
  decimals: 18,
  logoUrl: null,
};





const TokenSelector: React.FC<TokenSelectorProps> = ({
  label,
  value,
  onChange,
  balance,
  amount,
  amountUSD,
  onAmountChange,
  onMaxClick,
  disabled = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [favoriteTokens, setFavoriteTokens] = useState<string[]>([]);
  const [, setRecentTokens] = useState<string[]>([]);


  const [isSearchingByAddress, setIsSearchingByAddress] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importTokenInfo, setImportTokenInfo] = useState<{
    symbol: string;
    name: string;
    decimals: number;
    address: string;
    totalSupply?: string;
    holdersCount?: number;
  } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const { tokens, addToken, getTokenById, refreshBalances, isLoadingBalances } = useTokenRegistry();

  const { isConnected, walletAddress } = useWallet();
  const { price: nativeTokenPrice } = useTokenPrice();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFavoriteTokens(JSON.parse(localStorage.getItem('extswap_favorite_tokens') || '[]'));
      setRecentTokens(JSON.parse(localStorage.getItem('extswap_recent_tokens') || '[]'));
    }
  }, []);

  const selectedToken = getTokenById(value) || defaultTokenDisplay;


  const filteredTokens = tokens.filter(token =>
    !searchQuery ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const EXPLORER_API = API_CONFIG.EXPLORER_API_URL;

  const searchTokenByAddress = useCallback(async (address: string) => {
    try {
      setIsSearchingByAddress(true);
      setIsLoadingSearch(true);

      const existing = tokens.find(t => t.id === address);
      if (existing) {
        setImportTokenInfo(null);
        return;
      }

      const res = await fetch(`${EXPLORER_API}/tokens/${address}`);
      if (!res.ok) {
        setImportTokenInfo(null);
        return;
      }
      const json = await res.json();
      const tokenData = json.data || json;
      if (!tokenData) {
        setImportTokenInfo(null);
        return;
      }

      const importToken = {
        symbol: tokenData.symbol,
        name: tokenData.name,
        decimals: tokenData.decimals,
        address: address,
        totalSupply: tokenData.formattedTotalSupply,
        holdersCount: tokenData.holdersCount
      };

      setImportTokenInfo(importToken);
    } catch (err) {
      console.error('Error searching token:', err);
      setImportTokenInfo(null);
    } finally {
      setIsLoadingSearch(false);
    }
  }, [tokens, EXPLORER_API]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setIsSearchingByAddress(false);
      setImportTokenInfo(null);
    } else {
      const isAddress = searchQuery.trim().startsWith('0x') && searchQuery.trim().length >= 10;
      setIsSearchingByAddress(isAddress);

      if (isAddress) {
        searchTokenByAddress(searchQuery.trim());
      }
    }
  }, [searchQuery, tokens, searchTokenByAddress]);

  const fetchBalanceForToken = async (tokenId: string, tokenDecimals: number) => {
    if (!isConnected || !walletAddress || tokenId === 'text' || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const tokenContract = getERC20Contract(tokenId, provider);
      const balance = await tokenContract.balanceOf(walletAddress);
      formatUnits(balance, tokenDecimals);
      // Balance is handled by TokenRegistry
    } catch (err) {
      console.error(`Failed to fetch balance for ${tokenId}`, err);
    }
  };

  const handleImportToken = async () => {
    if (!importTokenInfo) return;
    setIsImporting(true);

    addToken(importTokenInfo);


    await fetchBalanceForToken(importTokenInfo.address, importTokenInfo.decimals);

    setIsImporting(false);
    handleTokenSelect(importTokenInfo.address);
  };

  const handleTokenSelect = (tokenId: string) => {
    if (disabled) return;

    setIsAnimating(true);

    setRecentTokens(prev => {
      const updated = [tokenId, ...prev.filter(id => id !== tokenId)].slice(0, 4);
      localStorage.setItem('extswap_recent_tokens', JSON.stringify(updated));
      return updated;
    });

    setTimeout(() => {
      onChange(tokenId);
      setIsModalOpen(false);
      setSearchQuery('');
      setIsAnimating(false);
    }, 150);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSearchQuery('');
  };

  const toggleFavorite = (tokenId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = favoriteTokens.includes(tokenId)
      ? favoriteTokens.filter(id => id !== tokenId)
      : [...favoriteTokens, tokenId];
    setFavoriteTokens(newFavorites);
    localStorage.setItem('extswap_favorite_tokens', JSON.stringify(newFavorites));
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleModalClose();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      if (isConnected) {
        refreshBalances();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isConnected, refreshBalances]);




  useEffect(() => {
    if (nativeTokenPrice) {

    }
  }, [nativeTokenPrice]);

  const loadTokenBalances = useCallback(async () => {
    if (!isConnected || !walletAddress) return;

    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);

        const nativeBalance = await provider.getBalance(walletAddress);
        formatUnits(nativeBalance, 18);
        // Native balance is handled by TokenRegistry

        const erc20Tokens = tokens.filter(token => token.id.startsWith('0x'));

        for (const token of erc20Tokens) {
          try {
            const tokenContract = getERC20Contract(token.id, provider);
            const decimals = await tokenContract.decimals();
            const tokenBalance = await tokenContract.balanceOf(walletAddress);
            formatUnits(tokenBalance, decimals);
            // Token balance is handled by TokenRegistry
          } catch (err) {
            console.error(`Error loading balance for token ${token.id}:`, err);
          }
        }
      }
    } catch (err) {
      console.error("Error loading token balances:", err);
    }
  }, [isConnected, walletAddress, tokens]);

  useEffect(() => {
    if (isModalOpen && isConnected) {
      loadTokenBalances();
    }
  }, [isModalOpen, isConnected, walletAddress, loadTokenBalances]);

  return (
    <>
      <div className={`card p-4 shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[var(--primary)]/20 ${disabled ? 'opacity-50' : ''}`}>
        <div className="flex justify-between items-center mb-3">
          <label className="text-[var(--text-secondary)] text-sm font-medium">{label}</label>
          {balance && (
            <div className="text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <span>Balance: <span className="font-semibold text-[var(--text-primary)]">{balance}</span></span>
                {onMaxClick && !disabled && (
                  <button
                    onClick={onMaxClick}
                    className="px-2 py-1 text-xs font-semibold text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 rounded-md transition-colors duration-200 cursor-pointer"
                  >
                    MAX
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                if (disabled) return;
                const value = e.target.value;
                // Only allow numbers, decimal point, and empty string
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  onAmountChange(value);
                }
              }}
              onKeyDown={(e) => {
                // Prevent non-numeric characters except backspace, delete, tab, escape, enter, and decimal point
                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '.', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                  e.preventDefault();
                }
                // Prevent multiple decimal points
                if (e.key === '.' && amount.includes('.')) {
                  e.preventDefault();
                }
              }}
              placeholder="0.0"
              disabled={disabled}
              className="w-full text-3xl font-bold bg-transparent outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 disabled:cursor-not-allowed disabled:opacity-60"
            />
            {amountUSD && (
              <div className="text-xs text-gray-500 mt-0.5">
                <span dangerouslySetInnerHTML={{ __html: formatCompactPrice(amountUSD) }}></span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => (disabled || !isMounted) ? undefined : setIsModalOpen(true)}
            disabled={disabled}
            className={`flex items-center gap-2 bg-[var(--hover)] hover:bg-[var(--card-border)] transition-all duration-200 rounded-2xl px-3 py-2 group shadow-md hover:shadow-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${(!isMounted || selectedToken.id === 'default') ? 'border-2 border-dashed border-[var(--primary)]/30' : ''}`}
          >
            {selectedToken.id === 'default' ? (
              <div className="w-7 h-7 bg-transparent rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            ) : (
              <TokenLogo symbol={selectedToken.symbol} logoUrl={selectedToken.logoUrl} size={28} />
            )}
            <span className={`font-bold text-lg ${(!isMounted || selectedToken.id === 'default') ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
              {!isMounted ? 'Select' : selectedToken.symbol}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
            onClick={handleModalClose}
          ></div>

          <div className="relative w-full max-w-sm mx-4 card p-0 shadow-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)] bg-gradient-to-r from-[var(--primary)]/5 to-[var(--secondary)]/5">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Select Token</h3>
                {isConnected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshBalances();
                    }}
                    className="p-1 hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 cursor-pointer"
                    disabled={isLoadingBalances}
                    title="Refresh token balances"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-[var(--primary)] ${isLoadingBalances ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                onClick={handleModalClose}
                className="p-1.5 hover:bg-[var(--hover)] rounded-lg transition-colors duration-200 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--text-secondary)]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="p-3 border-b border-[var(--card-border)]">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name or symbol"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-[var(--card-border)] bg-[var(--card-bg)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-all duration-200 text-sm"
                  autoFocus
                />
              </div>
            </div>



            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoadingSearch ? (
                <div className="p-6 space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonLoader key={i} width="w-full" height="h-6" />
                  ))}
                </div>
              ) : isSearchingByAddress && importTokenInfo && (
                <div className="p-4 border-b border-[var(--card-border)]">
                  <div className="bg-[var(--hover)]/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">Token Found</h4>
                      <div className="px-2 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs rounded-full">
                        Not in token list
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <TokenLogo symbol={importTokenInfo.symbol} size={40} />
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">{importTokenInfo.symbol}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{importTokenInfo.name}</p>
                      </div>
                    </div>

                    <div className="bg-[var(--hover)]/50 rounded-lg p-3 mb-4 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Decimals</span>
                        <span className="text-[var(--text-primary)] font-medium">{importTokenInfo.decimals}</span>
                      </div>
                      {importTokenInfo.totalSupply && (
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Total Supply</span>
                          <span className="text-[var(--text-primary)] font-medium">{importTokenInfo.totalSupply}</span>
                        </div>
                      )}
                      {importTokenInfo.holdersCount && (
                        <div className="flex justify-between">
                          <span className="text-[var(--text-secondary)]">Holders</span>
                          <span className="text-[var(--text-primary)] font-medium">{importTokenInfo.holdersCount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                      <p className="text-yellow-600 dark:text-yellow-400 text-xs">
                        ⚠️ Make sure this is the correct token address. Importing unknown tokens can be risky.
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] mb-2">
                      <span>Address</span>
                      <span className="font-mono">{importTokenInfo.address.slice(0, 6)}...{importTokenInfo.address.slice(-4)}</span>
                    </div>

                    <button
                      onClick={handleImportToken}
                      disabled={isImporting}
                      className="w-full mt-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isImporting ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Importing...
                        </div>
                      ) : (
                        'Import Token'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {isLoadingSearch ? (
                <div className="p-6 space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonLoader key={i} width="w-full" height="h-6" />
                  ))}
                </div>
              ) : filteredTokens.length === 0 && !importTokenInfo ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-[var(--hover)] rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.58-6.193 1.613a.36.36 0 01-.546-.43c.032-.142.073-.287.122-.434A11.956 11.956 0 016 12c0-1.657.338-3.236.956-4.677" />
                    </svg>
                  </div>
                  {isSearchingByAddress ? (
                    <>
                      <div className="text-[var(--text-primary)] font-medium mb-1 text-sm">No token found</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        This token doesn&apos;t exist or cannot be imported
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[var(--text-primary)] font-medium mb-1 text-sm">No tokens available</div>
                      <div className="text-xs text-[var(--text-secondary)]">Please add tokens to get started</div>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-1">
                  {filteredTokens.map((token: TokenData, index: number) => (
                    <div
                      key={token.id}
                      className={`w-full flex items-center justify-between p-3 hover:bg-[var(--hover)] rounded-xl transition-all duration-200 group cursor-pointer ${isAnimating ? 'animate-pulse' : ''}`}
                      onClick={() => handleTokenSelect(token.id)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <TokenLogo symbol={token.symbol} logoUrl={token.logoUrl} size={36} />
                          <div
                            onClick={(e) => toggleFavorite(token.id, e)}
                            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--card-bg)] rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-2.5 w-2.5 ${favoriteTokens.includes(token.id) ? 'fill-red-500' : ''}`} viewBox="0 0 20 20" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{token.symbol}</div>
                          <div className="text-xs text-[var(--text-secondary)]">{token.name}</div>
                          {token.id.startsWith('0x') && token.id !== 'text' && (
                            <div className="mt-1">
                              <span className="px-1.5 py-0.5 text-xs bg-[var(--primary)]/10 text-[var(--primary)] rounded-md">
                                Imported
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-medium text-[var(--text-primary)]">{formatTokenPrice(token.price)}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${token.isPositive ? 'bg-green-100 !text-green-700 dark:bg-green-500/20 dark:!text-green-400' : 'bg-red-100 !text-red-700 dark:bg-red-500/20 dark:!text-red-400'}`}>
                              {token.change24h}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[var(--text-primary)]">
                          {isConnected ? (
                            isLoadingBalances ? (
                              <div className="flex items-center justify-end">
                                <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) :
                              parseFloat(token.balance) > 0 ? (
                                token.balance
                              ) : (
                                '-'
                              )
                          ) : '-'}
                        </div>
                        {isConnected && !isLoadingBalances && parseFloat(token.balance) > 0 && (() => {
                          const balanceNum = parseFloat(token.balance);
                          if (isNaN(balanceNum) || balanceNum === 0) return null;

                          const priceNum = token.id === 'text'
                            ? parseFloat(nativeTokenPrice || '0')
                            : parseFloat(token.price.replace(/[^0-9.]/g, ''));
                          if (isNaN(priceNum) || priceNum === 0) return null;

                          const usdVal = balanceNum * priceNum;
                          return (
                            <div className="text-xs text-[var(--text-tertiary)]">
                              ≈ {formatTokenPrice(usdVal)}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[var(--card-border)] bg-[var(--hover)]/30">
              <p className="text-xs text-[var(--text-secondary)] text-center">
                Can&apos;t find a token?
                <button
                  onClick={() => setSearchQuery(searchQuery || '0x')}
                  className="ml-1 text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium transition-colors cursor-pointer hover:underline"
                >
                  Import by address
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TokenSelector; 