import { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/config';


interface DexStatsData {
  total_pairs: number;
  total_volume_24h: string;
  total_volume_7d: string;
  total_fees_24h: string;
  total_fees_7d: string;
  total_trades_24h: number;
  total_liquidity: string;
  active_pairs: number;
}

export function useDexStats() {
  const [tvl, setTvl] = useState<string>("0");
  const [volume24h, setVolume24h] = useState<string>("0");
  const [volume7d, setVolume7d] = useState<string>("0");
  const [activePools, setActivePools] = useState<number>(0);
  const [fees24h, setFees24h] = useState<string>("0");
  const [fees7d, setFees7d] = useState<string>("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const response = await fetch(getApiUrl('/market/summary'));
        const result = await response.json();
        
        if (result.success && result.data) {
          const data: DexStatsData = result.data;
          setTvl(data.total_liquidity || "0");
          setVolume24h(data.total_volume_24h || "0");
          setVolume7d(data.total_volume_7d || "0");
          setActivePools(data.active_pairs || 0);
          setFees24h(data.total_fees_24h || "0");
          setFees7d(data.total_fees_7d || "0");
        } else {
          throw new Error("Invalid response format");
        }
      } catch (e) {
        console.error("Error fetching DEX stats:", e);
        setTvl("0");
        setVolume24h("0");
        setVolume7d("0");
        setActivePools(0);
        setFees24h("0");
        setFees7d("0");
      }
      setLoading(false);
    }
    
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return { 
    tvl, 
    volume24h, 
    volume7d, 
    activePools, 
    fees24h,
    fees7d,
    loading 
  };
} 