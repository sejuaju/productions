import { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/config';


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

export interface TokenDetail {
    chain_id: number;
    token_address: string;
    symbol: string;
    name: string;
    decimals: number;
    logo_url?: string | null;
    total_supply: string;
    is_verified: boolean;
    price_usd: number;
    pair_count: number;
    volume_24h: number;
}

export interface PoolStats {
    pair_address: string;
    token0_symbol: string;
    token1_symbol: string;
    symbol: string;
    volume_24h: number;
    volume_24h_native: number;
    trades_24h: number;
    low_24h: number;
    high_24h: number;
    low_24h_native: number;
    high_24h_native: number;
    total_trades: number;
    total_volume_usd: number;
    total_volume_native: number;
    last_trade_time: string;
    current_price: number;
    current_price_native: number;
    price_change_percent_24h: number;
    price_24h_ago: number;
    price_24h_ago_native: number;
}

export interface LiquidityEvent {
    pair_address: string;
    action: 'add' | 'remove';
    amount0: string;
    amount1: string;
    lp_tokens: string;
    liquidity_usd: number;
    user_address: string;
    timestamp: string;
    tx_hash: string;
}

export interface PoolDetailData {
    chain: Chain;
    dex: DexInfo;
    pair_address: string;
    symbol: string;
    token0: TokenDetail;
    token1: TokenDetail;
    stats: PoolStats;
    liquidity_events: LiquidityEvent[];
    apr: number;
    fee: number;
    total_value_locked_usd: number;
}

interface PoolDetailApiResponse {
    data: PoolDetailData;
    success: boolean;
}

export function usePoolDetail(pairAddress: string | null) {
  const [poolDetail, setPoolDetail] = useState<PoolDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchPoolDetail() {
      if (!pairAddress) {
        setPoolDetail(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(getApiUrl(`/pools/${pairAddress}/details`));
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const result: PoolDetailApiResponse = await res.json();
        
        if (result.success) {
            setPoolDetail(result.data);
        } else {
            throw new Error('API request failed');
        }
      } catch (err) {
        console.error('Error fetching pool detail:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setPoolDetail(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPoolDetail();
  }, [pairAddress]);

  return { poolDetail, loading, error };
} 