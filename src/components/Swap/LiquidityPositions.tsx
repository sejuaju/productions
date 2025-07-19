"use client"

import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useExtSwap } from '@/hooks/useExtSwap';
import { useDexPairs } from '@/hooks/useDexPairs';
import { useTokenRegistry } from '@/hooks/useTokenRegistry';
import { getExplorerAddressUrl } from '../../utils/config';
import RemoveLiquidityModal from './RemoveLiquidityModal';
import {
  formatTokenDisplay,
  formatPoolShare,
  formatExchangeRate,
  shortenAddress
} from '@/utils/tokenFormatter';
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

export interface LiquidityPositionsRef {
  refreshPositions: () => void;
  addUserToken: (tokenAddress: string) => void;
}

interface LiquidityPositionsProps {
  selectedTokenAddress?: string;
}

const LiquidityPositions = forwardRef<LiquidityPositionsRef, LiquidityPositionsProps>(({ selectedTokenAddress }, ref) => {
  const { isConnected, walletAddress } = useWallet();
  const {
    isValidNetwork,
    getTokenInfo,
    getPairInfo,
    getTEXTBalance
  } = useExtSwap();
  const { pairs } = useDexPairs();
  const { getTokenById } = useTokenRegistry();

  const [positions, setPositions] = useState<LiquidityPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [textBalance, setTextBalance] = useState('0');
  const [hasDustPositions, setHasDustPositions] = useState(false);

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<LiquidityPosition | null>(null);

  // Helper function to find logo URLs - use TokenRegistry for tEXT, pairs API for other tokens
  const findTokenLogos = useCallback((tokenAddress: string, pairAddress: string) => {
    // Always use TokenRegistry logo for tEXT to ensure consistency
    const textToken = getTokenById('text');
    const textLogoUrl = textToken?.logoUrl || undefined;

    // Find token logo from pairs data or TokenRegistry
    let tokenLogoUrl: string | undefined = undefined;
    const tokenFromRegistry = getTokenById(tokenAddress);
    if (tokenFromRegistry?.logoUrl) {
      tokenLogoUrl = tokenFromRegistry.logoUrl;
    } else {
      // Fallback to pairs API
      const pair = pairs.find(p => p.pair_address.toLowerCase() === pairAddress.toLowerCase());
      if (pair) {
        if (pair.token0_address.toLowerCase() === tokenAddress.toLowerCase()) {
          tokenLogoUrl = pair.token0_logo_url || undefined;
        } else if (pair.token1_address.toLowerCase() === tokenAddress.toLowerCase()) {
          tokenLogoUrl = pair.token1_logo_url || undefined;
        }
      }
    }

    return { textLogoUrl, tokenLogoUrl };
  }, [pairs, getTokenById]);

  const loadTextBalance = useCallback(async () => {
    try {
      const balance = await getTEXTBalance();
      setTextBalance(balance);
    } catch (err) {
      console.error('Failed to load tEXT balance:', err);
    }
  }, [getTEXTBalance]);

  const loadPositions = useCallback(async () => {
    if (!isConnected || !walletAddress) {
      setPositions([]);
      setHasDustPositions(false);
      setIsInitialLoad(false);
      return;
    }

    // Only show loading spinner on initial load or manual refresh
    if (isInitialLoad || positions.length === 0) {
      setIsLoading(true);
    }

    try {
      const userTokensKey = `extswap_user_tokens_${walletAddress}`;
      const savedTokens = localStorage.getItem(userTokensKey);
      const userSelectedTokens: string[] = savedTokens ? JSON.parse(savedTokens) : [];

      if (!selectedTokenAddress) {
        setPositions([]);
        setHasDustPositions(false);
        setIsInitialLoad(false);
        setIsLoading(false);
        return;
      }

      if (userSelectedTokens.length === 0) {
        setPositions([]);
        setHasDustPositions(false);
        setIsInitialLoad(false);
        setIsLoading(false);
        return;
      }

      const loadedPositions: LiquidityPosition[] = [];
      let dustPositionsFound = false;

      const tokensToProcess = selectedTokenAddress && userSelectedTokens.includes(selectedTokenAddress)
        ? [selectedTokenAddress]
        : [];

      for (const tokenAddress of tokensToProcess) {
        try {
          const [tokenInfo, pairInfo] = await Promise.all([
            getTokenInfo(tokenAddress),
            getPairInfo(tokenAddress)
          ]);

          if (!tokenInfo) continue;

          if (pairInfo.exists &&
            pairInfo.lpBalance &&
            parseFloat(pairInfo.lpBalance) > 0 &&
            parseFloat(pairInfo.lpBalance) <= 0.0001) {
            dustPositionsFound = true;
          }

          if (pairInfo.exists &&
            pairInfo.lpBalance &&
            parseFloat(pairInfo.lpBalance) > 0.0001 &&
            pairInfo.totalSupply &&
            pairInfo.reserve0 &&
            pairInfo.reserve1) {

            const totalSupply = parseFloat(pairInfo.totalSupply);
            const userShare = parseFloat(pairInfo.lpBalance) / totalSupply;
            const token0Amount = parseFloat(pairInfo.reserve0) * userShare;
            const token1Amount = parseFloat(pairInfo.reserve1) * userShare;

            // Get logo URLs from pairs data
            const { textLogoUrl, tokenLogoUrl } = findTokenLogos(tokenAddress, pairInfo.address);

            const position: LiquidityPosition = {
              pairAddress: pairInfo.address,
              tokenAddress,
              tokenInfo,
              pairInfo,
              lpBalance: pairInfo.lpBalance,
              token0Amount: token0Amount.toString(),
              token1Amount: token1Amount.toString(),
              sharePercentage: formatPoolShare(pairInfo.lpBalance, pairInfo.totalSupply),
              totalValue: 'N/A',
              textLogoUrl,
              tokenLogoUrl
            };

            loadedPositions.push(position);
          }
        } catch (err) {
          console.error(`Failed to load position for token ${tokenAddress}:`, err);
        }
      }

      setPositions(loadedPositions);
      setHasDustPositions(dustPositionsFound);
    } catch (err) {
      console.error('Failed to load liquidity positions:', err);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [isConnected, walletAddress, selectedTokenAddress, getTokenInfo, getPairInfo, findTokenLogos, isInitialLoad, positions.length]);

  useEffect(() => {
    if (isConnected && isValidNetwork) {
      loadPositions();
      loadTextBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isValidNetwork, selectedTokenAddress]);

  const addUserToken = (tokenAddress: string) => {
    if (!walletAddress) return;

    const userTokensKey = `extswap_user_tokens_${walletAddress}`;
    const savedTokens = localStorage.getItem(userTokensKey);
    const currentTokens: string[] = savedTokens ? JSON.parse(savedTokens) : [];

    if (!currentTokens.includes(tokenAddress)) {
      const updatedTokens = [...currentTokens, tokenAddress];
      localStorage.setItem(userTokensKey, JSON.stringify(updatedTokens));
    }
  };

  const refreshPositions = () => {
    loadPositions();
    loadTextBalance();
  };

  useImperativeHandle(ref, () => ({
    refreshPositions,
    addUserToken
  }));

  const handleRemoveClick = (position: LiquidityPosition) => {
    setSelectedPosition(position);
    setIsRemoveModalOpen(true);
  };

  const handleRemoveSuccess = () => {
    refreshPositions();
  };

  if (!isConnected) {
    return (
      <div className="card p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Your Liquidity</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--hover)] rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-[var(--text-secondary)] mb-2">Connect your wallet</p>
          <p className="text-xs text-[var(--text-tertiary)]">to view your liquidity positions</p>
        </div>
      </div>
    );
  }

  if (!isValidNetwork) {
    return (
      <div className="card p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Your Liquidity</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400 mb-2">Wrong Network</p>
          <p className="text-xs text-[var(--text-tertiary)]">Please switch to ExatechL2</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">Your Liquidity</h3>
        <button
          onClick={refreshPositions}
          disabled={isLoading}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--hover)] rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          title="Refresh positions"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Always show wallet balance when connected - prevents flickering */}
      {isConnected && walletAddress && (
        <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">Wallet Balance</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                {formatTokenDisplay(textBalance, 'tEXT')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--text-secondary)] mb-1">Address</p>
              <p className="text-sm font-mono text-[var(--text-primary)]">
                {shortenAddress(walletAddress || '')}
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 mx-auto mb-3 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--text-secondary)] text-sm">Loading positions...</p>
        </div>
      )}

      {!isLoading && positions.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--hover)] rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-[var(--text-secondary)] mb-2">No active liquidity positions</p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {hasDustPositions
              ? 'You have removed most of your liquidity. Add more liquidity to see active positions.'
              : 'Add liquidity to get started'
            }
          </p>
          {hasDustPositions && (
            <div className="mt-3 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <p className="text-orange-600 dark:text-orange-400 text-xs">
                💡 Small LP amounts (&lt; 0.0001) are hidden to reduce clutter
              </p>
            </div>
          )}
        </div>
      )}

      {!isLoading && positions.length > 0 && (
        <div className="space-y-4">
          {positions.map((position) => (
            <div key={position.pairAddress} className="border border-[var(--card-border)] rounded-lg p-4 hover:border-[var(--primary)]/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
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
                      Pool Share: {position.sharePercentage}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {formatTokenDisplay(position.lpBalance, 'EXT-LP')}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">LP Tokens</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[var(--hover)] rounded-lg p-3">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Your tEXT</p>
                  <p className="font-bold text-[var(--text-primary)]">
                    {formatTokenDisplay(position.token1Amount, 'tEXT')}
                  </p>
                </div>
                <div className="bg-[var(--hover)] rounded-lg p-3">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">Your {position.tokenInfo.symbol}</p>
                  <p className="font-bold text-[var(--text-primary)]">
                    {formatTokenDisplay(position.token0Amount, position.tokenInfo.symbol)}
                  </p>
                </div>
              </div>

              <div className="border-t border-[var(--card-border)] pt-3">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-[var(--text-secondary)]">Pool Rate</span>
                  <span className="text-[var(--text-primary)]">
                    {position.pairInfo.reserve0 && position.pairInfo.reserve1 ?
                      formatExchangeRate(
                        parseFloat(position.pairInfo.reserve1) / parseFloat(position.pairInfo.reserve0),
                        'tEXT',
                        position.tokenInfo.symbol
                      ) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--text-secondary)]">Pool Address</span>
                  <span className="text-[var(--text-tertiary)] font-mono">
                    {shortenAddress(position.pairAddress)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleRemoveClick(position)}
                  disabled={!position.lpBalance || parseFloat(position.lpBalance) <= 0.0001}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${!position.lpBalance || parseFloat(position.lpBalance) <= 0.0001
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
                    }`}
                >
                  {!position.lpBalance || parseFloat(position.lpBalance) <= 0.0001
                    ? 'No Liquidity'
                    : 'Remove Liquidity'}
                </button>
                <button
                  onClick={() => window.open(getExplorerAddressUrl(position.pairAddress, 'exatech'), '_blank')}
                  className="px-3 py-2 border border-[var(--card-border)] hover:border-[var(--primary)]/50 rounded-lg text-sm font-medium text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  View on Explorer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Earn 0.3% fees on all swaps proportional to your pool share
        </p>
      </div>

      <RemoveLiquidityModal
        position={selectedPosition}
        isOpen={isRemoveModalOpen}
        onClose={() => {
          setIsRemoveModalOpen(false);
          setSelectedPosition(null);
        }}
        onSuccess={handleRemoveSuccess}
      />
    </div>
  );
});

LiquidityPositions.displayName = 'LiquidityPositions';

export default LiquidityPositions; 