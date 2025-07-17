import { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { getApiUrl } from '../utils/config';
import { isExatechL2 } from '@/utils/contracts';

export interface Chain {
  id: number;
  name: string;
  native_symbol: string;
  logo_url: string;
}

export interface DexInfo {
  name: string;
  type: string;
}

export interface Pool {
  chain: Chain;
  dex: DexInfo;
  pair_address: string;
  token0_address: string;
  token1_address: string;
  token0_symbol: string;
  token1_symbol: string;
  token0_logo_url?: string | null;
  token1_logo_url?: string | null;
  symbol: string;
  last_price_native: number;
  last_price_usd: number;
  liquidity_usd: number;
  volume_24h_usd: number;
  swap_count_24h: number;
  fee: number;
  apr: number;
  last_swap_time: string;
}

interface PoolStats {
  totalTVL: string; // This might need a separate source or calculation
  userTotalLiquidity: string;
  userPoolCount: number;
  totalVolume24h: string;
}

interface ApiResponse {
  count: number;
  data: Pool[];
  success: boolean;
}

export const usePools = () => {
  const [pools, setPools] = useState<Pool[]>([]);
  const [poolStats, setPoolStats] = useState<PoolStats>({
    totalTVL: '0',
    userTotalLiquidity: '0',
    userPoolCount: 0,
    totalVolume24h: '0'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isConnected, walletAddress, chainId } = useWallet();
  const isValidNetwork = isExatechL2(chainId);
  
  const fetchUserPools = async () => {
    if (!isConnected || !walletAddress || !isValidNetwork) {
      setPools([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(getApiUrl(`/all-pools?provider=${walletAddress}`));
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setPools(data.data || []); // Ensure we set an empty array if data is null
        
        // Check if data.data is not null and has items
        if (data.data && data.data.length > 0) {
          const userTotalLiquidity = data.data.reduce((sum, pool) => 
            sum + (pool.liquidity_usd || 0), 0).toString();
          
          const totalVolume = data.data.reduce((sum, pool) => 
            sum + (pool.volume_24h_usd || 0), 0).toString();
            
          setPoolStats({
            totalTVL: '0', // This would need to be fetched separately
            userTotalLiquidity,
            userPoolCount: data.count,
            totalVolume24h: totalVolume
          });
        } else {
            setPools([]);
            setPoolStats({
                totalTVL: '0',
                userTotalLiquidity: '0',
                userPoolCount: 0,
                totalVolume24h: '0'
            });
        }
      } else {
        throw new Error('Failed to fetch user pools');
      }
    } catch (err) {
      console.error('Error fetching user pools:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPools([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch pools when wallet changes
  useEffect(() => {
    fetchUserPools();
  }, [isConnected, walletAddress, isValidNetwork]);
  
  const refreshPools = () => {
    fetchUserPools();
  };
  
  return {
    pools,
    poolStats,
    isLoading,
    error,
    refreshPools,
    isValidNetwork
  };
}; 