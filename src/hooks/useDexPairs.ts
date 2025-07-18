import { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/config';

export interface DexPair {
  pair_address: string;
  token0_address: string;
  token1_address: string;
  token0_symbol: string;
  token1_symbol: string;
  token0_logo_url?: string | null;
  token1_logo_url?: string | null;
  pair_symbol: string; 
  last_price_native: string;
  last_price_usd: string;
  total_liquidity_usd: string; 
  volume_24h: string; 
  apr: string;
  fee_percent: string; 
  last_swap_time: string;
  swap_count_24h: number;
  user_lp_balance?: string;
  user_liquidity_value?: string;
  user_pool_share?: string;
  user_token0_amount?: string;
  user_token1_amount?: string;
  dex_type?: string;
  chain_name?: string;
  chain_logo_url?: string;

  id?: number;
  token0_name?: string;
  token1_name?: string;
  token0_decimals?: number;
  token1_decimals?: number;
  volume_7d?: string;
  reserve0_current?: string;
  reserve1_current?: string;
  factory_address?: string;
  fee_earned?: string;
  fee_24h?: string;
  creation_timestamp?: string;
  creation_transaction?: string;
  pair_type?: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  data: any[];  // Use any[] to handle the raw response before mapping
}

export function useDexPairs() {
  const [pairs, setPairs] = useState<DexPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchPairs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(getApiUrl('/all-pools'));
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data: ApiResponse = await res.json();
        
        if (data.success && data.data) {
          const mappedPairs: DexPair[] = data.data.map(item => ({
            pair_address: item.pair_address,
            token0_address: item.token0_address,
            token1_address: item.token1_address,
            token0_symbol: item.token0_symbol,
            token1_symbol: item.token1_symbol,
            token0_logo_url: item.token0_logo_url,
            token1_logo_url: item.token1_logo_url,
            pair_symbol: item.symbol,
            last_price_native: String(item.last_price_native),
            last_price_usd: String(item.last_price_usd),
            total_liquidity_usd: String(item.liquidity_usd),
            volume_24h: String(item.volume_24h_usd),
            apr: String(item.apr),
            fee_percent: String(item.fee),
            last_swap_time: item.last_swap_time,
            swap_count_24h: item.swap_count_24h,
            dex_type: item.dex.type,
            chain_name: item.chain.name,
            chain_logo_url: item.chain.logo_url,
          }));
          setPairs(mappedPairs);
        } else {
          setError("Failed to fetch pairs data");
          setPairs([]);
        }
      } catch (e) {
        console.error("Error fetching pairs:", e);
        setError(e instanceof Error ? e.message : "Unknown error");
        setPairs([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPairs();
    

    const interval = setInterval(fetchPairs, 60000);
    return () => clearInterval(interval);
  }, []);

  return { pairs, loading, error };
} 