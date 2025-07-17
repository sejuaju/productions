import { useState, useEffect, useCallback } from 'react';
import { useTokenPrice } from './useTokenPrice';
import { useWallet } from '@/context/WalletContext';
import { formatDisplayPrice } from '@/utils/tokenFormatter';
import { ethers } from 'ethers';
import { getERC20Contract, formatUnits } from '@/utils/contracts';
import { getApiUrl } from '../utils/config';

// Define the global TokenData interface with all necessary fields
export interface TokenData {
  id: string; // contract address or 'text' for native
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
  balance: string;
  price: string;
  change24h: string;
  isPositive: boolean;
  logoUrl?: string; // Add optional logoUrl
}

// Interface for the new token list API response
interface ApiToken {
  token_address: string;
  symbol: string;
  name: string;
  decimals: number;
  price_usd: string;
  logo_url?: string; // Add optional logo_url
}

interface ApiResponse {
  data: ApiToken[];
}

const nativeToken: TokenData = {
  id: 'text',
  symbol: 'tEXT',
  name: 'ExaTech Ether',
  decimals: 18,
  isNative: true,
  balance: '0',
  price: '$0.00',
  change24h: '+0.00%',
  isPositive: true,
  logoUrl: 'https://exatech.tech/favicon.ico', // Assuming a logo for the native token
};

// Singleton pattern to manage the token list globally
let tokenCache: TokenData[] | null = null;
let listeners: Array<(tokens: TokenData[]) => void> = [];
let isInitialized = false;

const updateTokenInCache = (id: string, updates: Partial<TokenData>) => {
  if (!tokenCache) return;
  const tokenIndex = tokenCache.findIndex(t => t.id.toLowerCase() === id.toLowerCase());
  if (tokenIndex !== -1) {
    tokenCache[tokenIndex] = { ...tokenCache[tokenIndex], ...updates };
  }
};

const notifyListeners = () => {
  if (tokenCache) {
    listeners.forEach(listener => listener([...tokenCache!]));
  }
};

const initializeTokenRegistry = async () => {
  if (isInitialized) return;
  isInitialized = true;

  const initialTokens = new Map<string, TokenData>();
  initialTokens.set(nativeToken.id, nativeToken);

  try {
    const res = await fetch(getApiUrl('/tokens?limit=100'));
    if (res.ok) {
      const json: ApiResponse = await res.json();
      // Add validation to ensure data exists and is an array
      if (json && json.data && Array.isArray(json.data)) {
        json.data.forEach(apiToken => {
        if (!initialTokens.has(apiToken.token_address.toLowerCase())) {
          initialTokens.set(apiToken.token_address.toLowerCase(), {
            id: apiToken.token_address,
            symbol: apiToken.symbol,
            name: apiToken.name,
            decimals: apiToken.decimals,
            isNative: false,
            balance: '0',
            price: formatDisplayPrice(apiToken.price_usd),
            change24h: '+0.00%',
            isPositive: true,
            logoUrl: apiToken.logo_url, // <-- Pass the logoUrl here
          });
        }
        });
      } else {
        console.warn('API response does not contain valid data array:', json);
      }
    }
  } catch (e) {
    console.error("Failed to fetch default token list from API", e);
  }
  
  try {
    if (typeof window !== 'undefined') {
      const importedTokensJson = localStorage.getItem('extswap_imported_tokens');
      if (importedTokensJson) {
        const importedTokens = JSON.parse(importedTokensJson);
        if (Array.isArray(importedTokens)) {
          importedTokens.forEach((token: any) => {
            if (!initialTokens.has(token.address.toLowerCase())) {
              initialTokens.set(token.address.toLowerCase(), {
                id: token.address,
                symbol: token.symbol,
                name: token.name,
                decimals: token.decimals,
                isNative: false,
                balance: '0',
                price: '$0.00',
                change24h: '+0.00%',
                isPositive: true,
              });
            }
          });
        }
      }
    }
  } catch (e) {
    console.error("Failed to load tokens from localStorage", e);
  }

  tokenCache = Array.from(initialTokens.values());
  notifyListeners();
};


export const addTokenToRegistry = (tokenInfo: { address: string; symbol: string; name: string; decimals: number }) => {
  if (!tokenCache) {
    console.error("Registry not initialized, cannot add token.");
    return;
  };
  const registry = tokenCache!;
  const exists = registry.some(t => t.id.toLowerCase() === tokenInfo.address.toLowerCase());

  if (!exists) {
    const newToken: TokenData = {
      id: tokenInfo.address,
      symbol: tokenInfo.symbol,
      name: tokenInfo.name,
      decimals: tokenInfo.decimals,
      isNative: false,
      // Add default values for new fields
      balance: '0',
      price: '$0.00',
      change24h: '+0.00%',
      isPositive: true,
    };
    registry.push(newToken);

    try {
      if (typeof window !== 'undefined') {
        const importedTokens = JSON.parse(localStorage.getItem('extswap_imported_tokens') || '[]');
        importedTokens.push(tokenInfo);
        localStorage.setItem('extswap_imported_tokens', JSON.stringify(importedTokens));
      }
    } catch(e) {
      console.error("Failed to save token to localStorage", e);
    }
    notifyListeners();
  }
};

export const updateTokenBalanceInRegistry = (tokenId: string, balance: string) => {
  if (!tokenCache) return;
  const tokenIndex = tokenCache.findIndex(t => t.id.toLowerCase() === tokenId.toLowerCase());
  if (tokenIndex !== -1) {
    tokenCache[tokenIndex].balance = balance;
    notifyListeners();
  }
};

export const useTokenRegistry = () => {
  const [tokens, setTokens] = useState<TokenData[]>(tokenCache || []);
  const [isLoading, setIsLoading] = useState(!isInitialized);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!isInitialized) {
        setIsLoading(true);
        await initializeTokenRegistry();
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const { price: nativeTokenPrice, priceChangePercentage24h, isUp } = useTokenPrice('tEXT');
  const { walletAddress, isConnected, balance: nativeTokenBalance } = useWallet();

  const loadAllTokenBalances = useCallback(async () => {
    if (!isConnected || !walletAddress || !tokenCache) return;

    setIsLoadingBalances(true);
    const provider = new ethers.BrowserProvider(window.ethereum);

    const balancePromises = tokenCache
      .filter(token => !token.isNative)
      .map(async (token) => {
        try {
          const contract = getERC20Contract(token.id, provider);
          const balance = await contract.balanceOf(walletAddress);
          const formattedBalance = formatUnits(balance, token.decimals);
          return { id: token.id, balance: parseFloat(formattedBalance).toFixed(4) };
        } catch (error) {
          console.error(`Failed to fetch balance for ${token.symbol}:`, error);
          return { id: token.id, balance: '0' }; // Return 0 on error
        }
      });

    const results = await Promise.all(balancePromises);
    
    results.forEach(result => {
      updateTokenInCache(result.id, { balance: result.balance });
    });

    notifyListeners();
    setIsLoadingBalances(false);
  }, [isConnected, walletAddress]);

  useEffect(() => {
    if (isConnected && walletAddress) {
      loadAllTokenBalances();
    }
  }, [isConnected, walletAddress, loadAllTokenBalances]);

  useEffect(() => {
    if (nativeTokenPrice && parseFloat(nativeTokenPrice) > 0) {
      updateTokenInCache('text', {
        price: formatDisplayPrice(nativeTokenPrice),
        change24h: `${isUp ? '+' : ''}${parseFloat(priceChangePercentage24h).toFixed(2)}%`,
        isPositive: isUp,
      });
      notifyListeners();
    }
  }, [nativeTokenPrice, priceChangePercentage24h, isUp]);

  useEffect(() => {
    if (nativeTokenBalance) {
      updateTokenInCache('text', {
        balance: parseFloat(nativeTokenBalance).toFixed(4)
      });
      notifyListeners();
    }
  }, [nativeTokenBalance]);

  useEffect(() => {
    const listener = (newTokens: TokenData[]) => {
      setTokens(newTokens);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const getTokenById = useCallback((id: string): TokenData | undefined => {
    if (!id || !tokenCache) return undefined;
    return tokenCache.find(t => t.id.toLowerCase() === id.toLowerCase());
  }, []);

  return { 
    tokens, 
    addToken: addTokenToRegistry, 
    getTokenById, 
    updateTokenBalance: updateTokenBalanceInRegistry,
    refreshBalances: loadAllTokenBalances,
    isLoadingBalances
  };
}; 